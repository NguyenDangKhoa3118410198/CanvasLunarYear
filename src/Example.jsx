import { useRef, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';

const AnimatedCanvas = () => {
  const canvasRef = useRef(null);
  const backgroundCanvasRef = useRef(null);
  const [selectedEnvelope, setSelectedEnvelope] = useState(null);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [isCanvasClickable, setCanvasClickable] = useState(true);
  const [amount, setAmount] = useState(null);
  const envelopesRef = useRef([]);

  const popupSound = useMemo(() => {
    const sound = new Audio('/assets/firework.mp3');
    sound.volume = 0.2;
    return sound;
  }, []);

  useEffect(() => {
    const backgroundCanvas = backgroundCanvasRef.current;
    const backgroundCtx = backgroundCanvas.getContext('2d');
    backgroundCanvas.width = window.innerWidth;
    backgroundCanvas.height = window.innerHeight;

    const stars = Array.from({ length: 100 }, () => ({
      x: Math.random() * backgroundCanvas.width,
      y: Math.random() * backgroundCanvas.height,
      radius: Math.random() * 2,
      opacity: Math.random(),
      speed: Math.random() * 0.05 + 0.01,
    }));

    const drawBackground = () => {
      backgroundCtx.fillStyle = 'black';
      backgroundCtx.fillRect(
        0,
        0,
        backgroundCanvas.width,
        backgroundCanvas.height
      );

      stars.forEach((star) => {
        star.opacity += star.speed;
        if (star.opacity >= 1 || star.opacity <= 0) {
          star.speed = -star.speed;
        }

        backgroundCtx.beginPath();
        backgroundCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        backgroundCtx.fillStyle = `rgba(255, 255, 255, ${Math.abs(
          star.opacity
        )})`;
        backgroundCtx.fill();
      });

      requestAnimationFrame(drawBackground);
    };

    drawBackground();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const images = [
      '/assets/lixi1.png',
      '/assets/lixi2.png',
      '/assets/lixi3.png',
      '/assets/lixi4.png',
      '/assets/lixi5.png',
      '/assets/lixi6.png',
      '/assets/lixi7.png',
      '/assets/lixi8.png',
      '/assets/lixi9.png',
      '/assets/lixi10.png',
    ];

    const loadedImages = images.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    if (envelopesRef.current.length === 0) {
      const createEnvelopes = () => {
        images.forEach((src, index) => {
          envelopesRef.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            width: 100,
            height: 210,
            radius: 8,
            vx: Math.floor(Math.random() * 2) + 1,
            vy: Math.floor(Math.random() * 2) + 1,
            selected: false,
            image: loadedImages[index],
          });
        });
      };
  
      createEnvelopes();
    }

    const updateEnvelopes = () => {
      envelopesRef.current.forEach((envelope) => {
        envelope.x += envelope.vx;
        envelope.y += envelope.vy;

        if (envelope.x <= 0 || envelope.x + envelope.width >= canvas.width) {
          envelope.vx = -envelope.vx;
          envelope.x = Math.max(
            0,
            Math.min(envelope.x, canvas.width - envelope.width)
          );
        }
        if (envelope.y <= 0 || envelope.y + envelope.height >= canvas.height) {
          envelope.vy = -envelope.vy;
          envelope.y = Math.max(
            0,
            Math.min(envelope.y, canvas.height - envelope.height)
          );
        }
      });
    };

    const drawEnvelopes = () => {
      envelopesRef.current.forEach((envelope) => {
        ctx.drawImage(
          envelope.image,
          envelope.x,
          envelope.y,
          envelope.width,
          envelope.height
        );
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      updateEnvelopes();
      drawEnvelopes();
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  const handleCanvasClick = (event) => {
    if (!isCanvasClickable) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    for (let i = 0; i < envelopesRef.current.length; i++) {
      const envelope = envelopesRef.current[i];
      if (
        mouseX >= envelope.x &&
        mouseX <= envelope.x + envelope.width &&
        mouseY >= envelope.y &&
        mouseY <= envelope.y + envelope.height
      ) {
        if (selectedEnvelope === envelope) {
          setPopupVisible(false);
          setSelectedEnvelope(null);
          setCanvasClickable(true);
        } else {
          const randomAmount = [10000, 20000, 50000, 100000];
          const randomIndex = Math.floor(Math.random() * randomAmount.length);
          setAmount(randomAmount[randomIndex]);

          setSelectedEnvelope(envelope);
          setPopupVisible(true);
          setCanvasClickable(false);
          popupSound.play();

          confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: 0.5, y: 0.5 },
            colors: ['#ff0000', '#ffd700', '#ff4500'],
          });

          envelopesRef.current.splice(i, 1);
        }
        break;
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.addEventListener('click', handleCanvasClick);
    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [selectedEnvelope, isCanvasClickable]);

  const closePopup = () => {
    setPopupVisible(false);
    setSelectedEnvelope(null);
    setCanvasClickable(true);
  };

  const formatAmount = (value) => {
    return value.toLocaleString() !== '0'
      ? `${value.toLocaleString()}đ`
      : 'Chúc bạn may mắn lần sau';
  };

  return (
    <>
      <div
        style={{
          width: '200px',
          height: '100px',
          position: 'absolute',
          zIndex: 1000,
          right: '10px',
          bottom: '10px',
        }}
      >
        <iframe
          width='200'
          height='100'
          src='https://www.youtube.com/embed/-xE1Vj7rBEk?si=vCOnlsMZhi9335kJ&autoplay=1&mute=0'
          title='YouTube video player'
          frameBorder='0'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          referrerPolicy='strict-origin-when-cross-origin'
          allowFullScreen
        ></iframe>
      </div>
      <canvas
        ref={backgroundCanvasRef}
        style={{ position: 'absolute', zIndex: 0 }}
      />
      <canvas ref={canvasRef} style={{ position: 'absolute', zIndex: 1 }} />
      {isPopupVisible && selectedEnvelope && (
        <>
          <div style={overlayStyle}></div>
          <div style={popupStyle}>
            <div>
              <p
                className='flashing-text'
                style={{
                  textAlign: 'center',
                  fontFamily: 'Lavishly Yours',
                  fontSize: '40px',
                }}
              >
                Tài Lộc Quá Lớn
              </p>
              {amount !== null && (
                <h2
                  style={{
                    fontWeight: 600,
                    textAlign: 'center',
                    paddingBlock: '10px',
                    fontSize: '32px',
                  }}
                >
                  {formatAmount(amount)}
                </h2>
              )}
            </div>
            <button onClick={closePopup}>Close</button>
          </div>
        </>
      )}
    </>
  );
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  zIndex: 5,
};

const popupStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  width: '320px',
  height: '260px',
  borderRadius: '10px',
  wordSpacing: '8px',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  color: 'black',
  padding: '20px',
  border: '2px solid #000',
  zIndex: 10,
  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
};

const styles = `
  @keyframes flashing {
    0% { color: red; }
    50% { color: yellow; }
    100% { color: red; }
  }
  .flashing-text {
    animation: flashing 1s infinite;
  }
`;

const styleElement = document.createElement('style');
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);

export default AnimatedCanvas;
