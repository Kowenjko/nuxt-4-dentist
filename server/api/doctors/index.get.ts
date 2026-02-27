export default defineEventHandler(async (event) => {
  const { specialty, serviceId } = getQuery(event)

  const where: any = {}
  if (specialty) where.specialty = { contains: specialty as string, mode: 'insensitive' }
  if (serviceId) where.services = { some: { id: serviceId as string } }

  const doctors = await prisma.doctorProfile.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, phone: true, avatar: true, email: true } },
      services: { select: { id: true, name: true, duration: true, price: true } },
      doctorSchedule: true,
    },
    orderBy: { specialty: 'asc' },
  })

  return doctors
})
