import React, { useState } from 'react';

const Home = () => {
	const [loginData, setLoginData] = useState(localStorage.getItem('loginData'));

	return <div>Ich bin Home</div>;
};

export default Home;
