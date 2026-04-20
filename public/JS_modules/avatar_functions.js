import { closeAvFrom } from './formFunctions.js';

const avatarContainer = document.getElementById('profile_img--cont');
const avatarForm = document.getElementById('add_userAvatar--form');

export const getAvatar = async function (req, res) {
	try {
		const response = await fetch('http://localhost:8088/avatar', {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			console.log('Błąd serwera');
			return;
		}

		const avatar = await response.json();
		const avFromDb = avatar.avatar;

		createAvatarHandler(avFromDb);
	} catch (error) {
		console.log('Wystąpił błąd podczas pobierania avatara.', error.message);
		return null;
	}
};

export const createAvatarHandler = function (avFromDb) {
	const existingAvatar = document.getElementById('userAvatar--img');

	if (existingAvatar) {
		avatarContainer.removeChild(existingAvatar);
	}

	const imgEl = document.createElement('img');
	imgEl.id = 'userAvatar--img';
	imgEl.setAttribute('style', 'width: 100%');

	if (avFromDb) {
		if (avFromDb.startsWith('http')) {
			imgEl.src = avFromDb;
		} else {
			imgEl.src = `../images/avatars/${avFromDb}`;
		}
	} else {
		imgEl.src = '../images/avatars/default.jpg';
	}

	avatarContainer.appendChild(imgEl);
};

export const showAvatarForm = function () {
	document.addEventListener('click', function (e) {
		if (e.target && e.target.matches('.add_userAvatar')) {
			avatarForm.classList.toggle('invisible');
			avatarForm.classList.toggle('visible');
		}
	});
};
export const closeAvatarForm = function () {
	document.addEventListener('click', function (e) {
		if (e.target && e.target.matches('.close_Avatar--form img')) {
			closeAvFrom();
		}
	});
};

export const uploadAvatar = function (e) {
	document.getElementById('upload_Avatar--form').addEventListener('submit', async function (e) {
		e.preventDefault();
		const form = document.getElementById('upload_Avatar--form');
		const formData = new FormData(form);

		try {
			const response = await fetch(form.action, {
				method: form.method,
				body: formData,
			});

			if (response.ok) {
				const result = await response.json();
				alert(result.message);
				avatarForm.classList.toggle('visible');
				avatarForm.classList.toggle('invisible');
			} else {
				const errorResult = await response.json();
				alert(errorResult.message);
				location.reload();
			}
		} catch (error) {
			console.log(error.message);
			alert('Nie udało się załadować avatara :(');
		}
	});
};
