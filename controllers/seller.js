import sendErrorResponse from '../helper/response.js'
import { prisma } from '../index.js'

// Get All Products --> GET
export const GetAllProducts = async (req, res) => {
  const { id: userId } = req.user
  try {
    const products = await prisma.product.findMany({
      where: {
        sellerId: userId,
      },
    })
    res.status(200).json(products)
  } catch (error) {
    console.log('Error in GetAllProducts Controller ', error)
    sendErrorResponse(res, 500, 'Internal server error')
  }
}

// Add new product --> POST
export const AddProduct = async (req, res) => {
  const { id: userId } = req.user
  const {
    name,
    description,
    price,
    discount,
    stock,
    category,
    images,
  } = req.body

  try {
    if (
      !name ||
      !description ||
      !price ||
      !discount ||
      !stock ||
      !category ||
      !images
    ) {
      sendErrorResponse(res, 400, 'Please provide proper data from products')
      return
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        discount,
        stock,
        category,
        images: images.length > 0 ? images : null,
        sellerId: userId,
      },
    })

    res.status(200).json({ message: 'Product added', product })
  } catch (error) {
    console.log('Error in AddProduct Controller ', error)
    sendErrorResponse(res, 500, 'Internal server error')
  }
}

// Delete Products --> DELETE
export const DeletelProduct = async (req, res) => {
  const { id: productId } = req.params
  const { id: userId } = req.user
  try {
    if (!productId) {
      sendErrorResponse(res, 400, 'Product id is missing')
      return
    }

    // Find Product
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    })
    if (!product) {
      sendErrorResponse(res, 400, 'Product not found')
      return
    }

    // Verify User
    if (product.sellerId !== userId) {
      sendErrorResponse(
        res,
        401,
        'You are not authorized to perform this action',
      )
      return
    }
    // Delete product
    await prisma.product.delete({
      where: {
        id: productId,
      },
    })
    // Send Response
    res.status(200).json({ message: `Product ${productId} deleted` })
  } catch (error) {
    console.log('ERROR IN DELETE PRODUCT CONTROLLER ', error)
    sendErrorResponse(res, 500, 'Internal server error')
  }
}

// Update Product --> PUT
export const UpdateProduct = async (req, res) => {
  const { name, description, price, discount, stock } = req.body

  const { id: prodId } = req.params

  try {
    if (!name && !description && !price && !discount && !stock) {
      sendErrorResponse(res, 400, 'Please provide required data')
      return
    }

    const product = await prisma.product.findUnique({
      where: {
        id: prodId,
      },
    })

    if (!product) {
      sendErrorResponse(res, 400, 'Product not found')
      return
    }

    await prisma.product.update({
      where: { id: prodId },
      data: {
        name: name || product.name,
        description: description || product.description,
        price: price || product.price,
        stock: stock || product.stock,
        discount: discount || product.discount,
      },
    })

    res.status(200).json({ message: 'Product updated' })
  } catch (error) {
    console.log('Error in UpdateProduct Controller ', error)
    sendErrorResponse(res, 500, 'Internal Server error')
  }
}
