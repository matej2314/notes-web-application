export const logOut = async function (req, res) {
	try {
		const response = await fetch('http://localhost:8088/logout', {
			method: 'POST',
			credentials: 'include',
		});

		if (response.ok) {
			alert('Wylogowano pomyślnie!');
			window.location.href = '/';
		} else {
			alert('Wylogowanie nie powiodło się');
		}
	} catch (error) {
		if (error) {
			console.log('Wystąpił błąd:', error.message);
			alert('Wystąpił błąd podczas wylogowywania.');
		}
	}
};

export const changeEmailFr = async function (req, res) {
	const changeMail_Modal = document.getElementById('change_userMail--form');
	const user_changeMail = document.getElementById('name_change--input');
	const user_oldMail = document.getElementById('old_userMail--input');
	const user_newMail = document.getElementById('new_userMail--input');

	try {
		console.log(user_changeMail.value, user_oldMail.value, user_newMail.value);
		const response = await fetch('http://localhost:8088/usermail', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username: user_changeMail.value, email: user_oldMail.value, newEmail: user_newMail.value }),
		});

		if (!response.ok) {
			console.log('Wystąpił błąd podczas zmiany adresu kontaktowego:', response.statusText);
			alert('Błąd podczas zmiany adresu kontaktowego.');
			return;
		}

		const res = await response.json();
		alert('Adres e-mail zmieniony poprawnie.');
		changeMail_Modal.classList.remove('visible');
		changeMail_Modal.classList.add('invisible');
	} catch (err) {
		if (err) {
			console.log('Błąd zmiany adresu e-mail:', err.message);
		}
	}
};

export const changePassFr = async function (req, res) {
	const name = document.getElementById('user_Name--input').value;
	const oldPass = document.getElementById('user_oldPass--input').value;
	const newPass = document.getElementById('user_newPass--input').value;

	if (!name || !oldPass || !newPass) {
		alert('Podaj wymagane dane!');
		return;
	}
	if (newPass.length < 10) {
		alert('Nowe hasło musi mieć minimum 10 znaków.');
		return;
	}
	if (oldPass === newPass) {
		alert('Hasła nie mogą być identyczne!');
		return;
	}

	try {
		const response = await fetch('http://localhost:8088/userpass', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ userName: name, oldPass: oldPass, newPass: newPass }),
		});

		if (!response.ok) {
			console.log(`Wystąpił błąd podczas zmiany hasła:, ${response.statusText || data.message}`);
		}

		if (response.ok) {
			alert('Hasło zostało zmienione.');
		}
	} catch (error) {
		if (error) {
			console.log('Błąd zmiany hasła', error.message);
		}
	}
};
