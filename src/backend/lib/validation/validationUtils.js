function isValidPassword(password) {
	// Minimum 8 znaków, przynajmniej jedna mała litera, jedna duża litera, jedna cyfra i jeden ze znaków specjalnych *!#^%$@?
	const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[*!#^%$@?])[a-zA-Z\d*!#^%$@?]{10,30}$/;
	return regex.test(password);
}

// Funkcja walidująca e-mail
function isValidEmail(email) {
	const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return regex.test(email);
}

// Funkcja walidująca nazwę użytkownika (alfanumeryczna, minimum 5 znaków)
function isValidUsername(username) {
	const regex = /^[a-zA-Z0-9]{5,}$/;
	return regex.test(username);
}

export { isValidPassword, isValidEmail, isValidUsername };