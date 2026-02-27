export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  const doctor = await prisma.doctorProfile.findUnique({ where: { id } })
  if (!doctor) throw createError({ statusCode: 404, statusMessage: 'Лікар не знайдений' })

  // Only the doctor themselves or admin can update
  if (doctor.userId !== auth.userId && auth.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Доступ заборонено' })
  }

  const body = await readBody(event)
  const { specialty, bio, serviceIds } = body

  const data: any = {}
  if (specialty) data.specialty = specialty
  if (bio !== undefined) data.bio = bio
  if (serviceIds) {
    data.services = {
      set: (serviceIds as string[]).map((sid: string) => ({ id: sid })),
    }
  }

  const updated = await prisma.doctorProfile.update({
    where: { id },
    data,
    include: {
      user: { select: { id: true, name: true, avatar: true, email: true } },
      services: { select: { id: true, name: true } },
    },
  })

  return updated
})
