export default defineEventHandler(async (event) => {
  //await requireRole(event, [Roles.ADMIN])

  const body = await readBody(event)
  const { name, duration, price } = body

  if (!name || !duration || price === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'необхідно вказати назву, тривалість та ціну',
    })
  }

  const service = await prisma.service.create({
    data: { name, duration: parseInt(duration), price },
  })

  return service
})
