import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const [count, setCount] = useState(20);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prevCount) => prevCount - 1);
    }, 1000);

    if (count === 0) {
      clearInterval(timer);
      navigate('/');
    }

    return () => clearInterval(timer);
  }, [count, navigate]);

  const goBack = () => {
    navigate('/');
  };

  return (
    <section>
      <div>
        <div>
          <p>404 error</p>
          <h1>Sayfa Bulunamadı</h1>
          <p>{count} Saniye Sonra Anasayfaya Yönlendirileceksiniz...</p>

          <div>
            <button onClick={goBack}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
              </svg>
              <span>Anasayfa</span>
            </button>
          </div>

        </div>

        <div>
          <img src="https://cdn.dribbble.com/userupload/11917061/file/original-a684447ee63b5ded923f3a8bb60b1638.jpg?resize=752x" alt="404" />
        </div>
      </div>
    </section>
  );
};

export default NotFound;
