import sendErrorResponse from '../helper/response.js'
import { stripe } from '../helper/stripe.js'
import { prisma } from '../index.js'

// Get all products
export const GetAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany()
    res.status(200).json(products)
  } catch (error) {
    console.log('Error in GetAllProducts Controller ', error)
    sendErrorResponse(res, 500, 'Internal server error')
  }
}

// Get a product
export const GetProduct = async (req, res) => {
  const { id: productId } = req.params

  try {
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    })
    if (!product) {
      sendErrorResponse(res, 400, 'Product not found')
      return
    }
    res.status(200).json(product)
  } catch (error) {
    console.log('Error in GetProduct Controller ', error)
    sendErrorResponse(res, 500, 'Internal server error')
  }
}

// Get Productz By category
export const GetProductsByCategory = async (req, res) => {
  const { category } = req.params
  const { sort } = req.query
  if (!category) {
    sendErrorResponse(res, 400, 'Provide category name')
    return
  }

  let orderBy = {}

  if (sort) {
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' }
    }
    if (sort === 'price_desc') {
      orderBy = { price: 'desc' }
    }
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        category: { equals: category },
      },
      orderBy: orderBy,
    })

    res.status(200).json(products)
  } catch (error) {
    console.log('Error in getProductsByCateogory ', error)
    sendErrorResponse(res, 500, 'Internal server error')
  }
}

//Search product
export const SearchProduct = async (req, res) => {
  const { query, sort } = req.query

  if (!query && !sort) {
    sendErrorResponse(res, 400, 'Please provide query parameters')
    return
  }

  let where = {}
  let orderBy = {}

  if (query) {
    where = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    }
  }

  if (sort) {
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' }
    }

    if (sort === 'price_desc') {
      orderBy = { price: 'desc' }
    }
  }

  try {
    const products = await prisma.product.findMany({
      where: where,
      orderBy: orderBy,
    })

    res.status(200).json(products)
  } catch (error) {
    console.log('Error in SearchProduct ', error)
    sendErrorResponse(res, 500, 'Internal server error')
  }
}

// Buy a product
export const BuyProduct = async (req, res) => {
  const { id: productId } = req.params
  const { quantity, address } = req.body

  try {
    // check if product exists
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    })
    if (!product) {
      sendErrorResponse(res, 400, 'Product not found')
      return
    }
    // check if enough stock
    if (product.stock < quantity) {
      sendErrorResponse(res, 400, 'Not enough stock')
      return
    }

    const discount = (product.price * product.discount) / 100
    const finalPrice = product.price - discount


    // create order
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        sellerId: product.sellerId,
        productId: productId,
        address: address,
        total: (finalPrice * quantity) + 1,
        quantity: quantity,
        paymentStatus: 'Pending',
        status: 'Pending',
      },
    })

    let session;
    try {
      // Create payment intent
     session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: { name: product.name },
            unit_amount: (finalPrice + order.shippingCharge) * 100,
          },
          quantity: quantity,
        },
      ],
      mode: 'payment',
      metadata: {
        orderId: order.id,
        productId: product.id,
      },
      success_url: `${process.env.CLIENT_URL}/payment/success`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    })

    } catch (stripeError) {
      console.error('Error creating Stripe session:', stripeError);
      sendErrorResponse(res, 500, 'Failed to initiate payment');
      return;
    }

    res.status(200).json({
      checkout_url: session.url,
      session_id: session.id,
    })
  } catch (error) {
    console.log('Error in BuyProduct Controller ', error)
    sendErrorResponse(res, 500, 'Internal server error')
  }
}

// Update order status
export const UpdateOrderStatus = async (req, res) => {
  //Set SessionId
  const { sessionId } = req.params

  try {
    // check id session is success
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status === 'paid') {
      const metadata = session.metadata
      const orderId = metadata.orderId
      const productId = metadata.productId

      //make order
      const order = await prisma.order.update({
        where: {
          id: orderId,
        },
        data:{
          status: 'Confirmed',
          paymentStatus: 'Success',
          stripeSessionId: sessionId
        },
      })

      //Get product
      const product = await prisma.product.findUnique({
        where: { id: productId },
      })

      // Update product stock
      await prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          stock: product.stock - order.quantity,
        },
      })

      res.status(200).json({ message: 'Order Confirmed', order })
      return
    }

    res.status(400).json({ error: 'Payment was unsuccessfull' })
  } catch (error) {
    console.log('Error in Checkout Controller ', error)
    sendErrorResponse(res, 500, 'Internal server error')
  }
}
