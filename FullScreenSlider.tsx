import React, { useState, useEffect, useCallback, useRef } from 'react';

interface SlideData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  bgColor: string; // Tailwind background color class
  textColor: string; // Tailwind text color class
  fontFamily: string; // Tailwind font family class
}

// Define the content for the 6 slides with improved color contrast
const slidesData: SlideData[] = [
  {
    id: 1,
    title: "Modern Architecture",
    subtitle: "Sleek & Sustainable Designs",
    description: "Exploring the harmony between cutting-edge design and environmental consciousness in urban landscapes.",
    bgColor: "bg-slate-900", // Darkened for better contrast
    textColor: "text-white",
    fontFamily: "font-serif",
  },
  {
    id: 2,
    title: "Digital Horizons",
    subtitle: "The Future of Connectivity",
    description: "Dive into the evolving world of technology and how it shapes our interactions and daily lives.",
    bgColor: "bg-blue-800", // Adjusted for better visibility
    textColor: "text-white",
    fontFamily: "font-sans",
  },
  {
    id: 3,
    title: "Minimalist Living",
    subtitle: "Simplicity in Every Detail",
    description: "Discover the beauty of less, focusing on intentionality and finding peace in uncluttered spaces.",
    bgColor: "bg-emerald-900", // Darkened
    textColor: "text-white",
    fontFamily: "font-mono",
  },
  {
    id: 4,
    title: "Culinary Journeys",
    subtitle: "Flavors Around the World",
    description: "Embark on a taste adventure, exploring diverse cuisines and the stories behind traditional dishes.",
    bgColor: "bg-rose-900",
    textColor: "text-white",
    fontFamily: "font-serif",
  },
  {
    id: 5,
    title: "Cosmic Wonders",
    subtitle: "Exploring the Universe",
    description: "Gaze into the vastness of space, uncovering the mysteries of distant galaxies and celestial phenomena.",
    bgColor: "bg-indigo-950", // Darkened
    textColor: "text-white",
    fontFamily: "font-sans",
  },
  {
    id: 6,
    title: "Urban Rhythms",
    subtitle: "The Pulse of the City",
    description: "Feel the energy of metropolitan life, capturing the dynamic spirit and diverse cultures of cityscapes.",
    bgColor: "bg-amber-800", // Adjusted
    textColor: "text-white",
    fontFamily: "font-mono",
  },
];

const SLIDE_DURATION = 5000; // 5 seconds

const FullScreenSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHoveringContent, setIsHoveringContent] = useState(false);
  const [transformStyle, setTransformStyle] = useState({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const progressBarKey = useRef<number>(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slidesData.length);
    progressBarKey.current += 1;
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slidesData.length - 1 : prevIndex - 1
    );
    progressBarKey.current += 1;
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    progressBarKey.current += 1;
  };

  const startTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        nextSlide();
      }
    }, SLIDE_DURATION);
  }, [isPaused, nextSlide]);

  useEffect(() => {
    startTimer();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startTimer]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        prevSlide();
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), SLIDE_DURATION);
      } else if (event.key === 'ArrowRight') {
        nextSlide();
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), SLIDE_DURATION);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [prevSlide, nextSlide]);

  useEffect(() => {
    const sliderElement = sliderRef.current;
    if (!sliderElement) return;

    const handleTouchStart = (event: TouchEvent) => {
      touchStartX.current = event.touches[0].clientX;
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (touchStartX.current === null) return;

      const touchEndX = event.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX.current;
      const minSwipeDistance = 50;

      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          prevSlide();
        } else {
          nextSlide();
        }
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), SLIDE_DURATION);
      }

      touchStartX.current = null;
    };

    sliderElement.addEventListener('touchstart', handleTouchStart);
    sliderElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    sliderElement.addEventListener('touchend', handleTouchEnd);

    return () => {
      sliderElement.removeEventListener('touchstart', handleTouchStart);
      sliderElement.removeEventListener('touchmove', handleTouchMove);
      sliderElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [prevSlide, nextSlide]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isHoveringContent) return;

    const { clientX, clientY, currentTarget } = event;
    const { top, left, width, height } = currentTarget.getBoundingClientRect();

    const x = clientX - left;
    const y = clientY - top;

    const centerX = width / 2;
    const centerY = height / 2;

    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    setTransformStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(-30px) scale(0.98)`,
      transition: 'transform 0.1s ease-out',
    });
  };

  const handleMouseEnterContent = () => {
    setIsHoveringContent(true);
  };

  const handleMouseLeaveContent = () => {
    setIsHoveringContent(false);
    setTransformStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0) scale(1)',
      transition: 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
    });
  };

  return (
    <div
      ref={sliderRef}
      className="relative h-screen w-full overflow-hidden bg-black"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-roledescription="carousel"
      aria-label="Full screen slider"
    >
      <div className="relative h-full w-full">
        {slidesData.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out ${slide.bgColor} ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${index + 1} of ${slidesData.length}`}
            aria-hidden={index !== currentIndex}
            style={{
              transition: 'opacity 1s ease-in-out, transform 1.5s ease-out',
              transform: index === currentIndex ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {/* Reduced overlay opacity for better color visibility */}
            <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"></div>

            <div className="absolute inset-0 flex items-center justify-center p-8" style={{ perspective: '1000px' }}>
              <div
                className={`relative z-20 max-w-3xl text-center transition-transform duration-500 ease-out ${slide.textColor} ${slide.fontFamily}`}
                onMouseEnter={handleMouseEnterContent}
                onMouseLeave={handleMouseLeaveContent}
                onMouseMove={handleMouseMove}
                style={index === currentIndex ? transformStyle : {}}
              >
                <h2
                  className={`text4xl md:text-6xl font-bold mb-4 transition-all duration-700 ease-out delay-300 ${
                    index === currentIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                  }`}
                >
                  {slide.title}
                </h2>
                <h3
                  className={`text-xl md:text-2xl font-semibold mb-6 transition-all duration-700 ease-out delay-500 ${
                    index === currentIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                  }`}
                >
                  {slide.subtitle}
                </h3>
                <p
                  className={`text-lg md:text-xl transition-all duration-700 ease-out delay-700 ${
                    index === currentIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                  }`}
                >
                  {slide.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          prevSlide();
          setIsPaused(true);
          setTimeout(() => setIsPaused(false), SLIDE_DURATION);
        }}
        className="absolute left-4 top-1/2 z-30 -translate-y-1/2 transform rounded-full bg-white/30 p-3 text-white backdrop-blur-sm transition hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        onClick={() => {
          nextSlide();
          setIsPaused(true);
          setTimeout(() => setIsPaused(false), SLIDE_DURATION);
        }}
        className="absolute right-4 top-1/2 z-30 -translate-y-1/2 transform rounded-full bg-white/30 p-3 text-white backdrop-blur-sm transition hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 transform space-x-3">
        {slidesData.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              goToSlide(index);
              setIsPaused(true);
              setTimeout(() => setIsPaused(false), SLIDE_DURATION);
            }}
            className={`h-3 w-3 rounded-full transition-all duration-300 ease-in-out hover:scale-125 focus:outline-none focus:ring-2 focus:ring-white/50 ${
              currentIndex === index ? 'bg-white scale-125' : 'bg-white/40'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={currentIndex === index ? 'true' : 'false'}
          ></button>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 z-30 h-1 w-full bg-white/20">
        <div
          key={progressBarKey.current}
          className="h-full bg-white"
          style={{
            animation: `progressBarFill ${SLIDE_DURATION}ms linear forwards`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          <style>{`
            @keyframes progressBarFill {
              from { width: 0%; }
              to { width: 100%; }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default FullScreenSlider;