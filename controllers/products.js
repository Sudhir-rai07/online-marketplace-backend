import sendErrorResponse from '../helper/response.js'
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
  if (!category) {
    sendErrorResponse(res, 400, 'Provide category name')
    return
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        category: {
          equals: category,
        },
      },
    })

    res.status(200).json(products)
  } catch (error) {
    console.log('Error in getProductsByCateogory ', error)
    sendErrorResponse(res, 500, 'Internal server error')
  }
}

// Buy a product
export const BuyProduct = async (req, res) => {
  const { id: productId } = req.params
  const { quantity, address, status, paymentMethod, paymentStatus } = req.body

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

    // create order
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        productId: product.id,
        address,
        status,
        total:
          quantity * product.price -
          (quantity * product.price) / product.discount,
        paymentMethod,
        paymentStatus,
      },
    })

    // update product stock
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: product.stock - quantity,
      },
    })

    const resData = {
      message: 'Product bought successfully',
      orderId: order.id,
      product: product.name,
      quantity: quantity,
      total: total,
      payment: {
        method: paymentMethod,
        status: paymentStatus,
      },
    }
    res.status(200).json(resData)
  } catch (error) {
    console.log('Error in BuyProduct Controller ', error)
    sendErrorResponse(res, 500, 'Internal server error')
  }
}

//Search product
export const SearchProduct = async (req, res) => {
  const {query} = req.query

  if(!query) {
    sendErrorResponse(res, 400, "Please provide query parameter")
    return
  }

  try {
      const products = await prisma.product.findMany({where:{
        OR:[
          {name:{contains: query, mode:'insensitive'}},
          {description: {contains:query, mode:'insensitive'}}
        ]
      }})

    res.status(200).json(products)
  } catch (error) {
    console.log('Error in SearchProduct ', error)
    sendErrorResponse(res, 500, 'Internal server error')
  }
}
