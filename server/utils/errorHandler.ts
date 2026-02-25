export const errorHandler = (statusCode: number, message: string) => {
	return createError({
		statusCode: statusCode,
		statusMessage: message,
	})
}
