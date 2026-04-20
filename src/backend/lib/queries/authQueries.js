export const authQueries = {
    checkEmailExists: 'SELECT email FROM users WHERE email = ?',
    registerUser: 'INSERT INTO users SET ?',
    loginUser: 'SELECT id, name, email, password FROM users WHERE email = ?',
    checkUserExists: 'SELECT id FROM users WHERE email = ? AND id != ?',
    checkUserData: 'SELECT id FROM users WHERE id = ? AND name = ? AND email = ?',
    updateEmail: 'UPDATE users SET email = ? WHERE id = ?',
    checkPassword: 'SELECT password FROM users WHERE id = ? AND name = ?',
    updatePassword: 'UPDATE users SET password = ? WHERE id = ?'

}