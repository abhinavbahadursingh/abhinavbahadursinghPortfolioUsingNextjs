import { useRef, useEffect, ReactNode } from "react";
import { useSpring, animated, to } from "@react-spring/web";

const calcX = (
  y: number,
  ly: number,
  containerCenterY: number,
  rotationFactor: number
) => -(y - ly - containerCenterY) / rotationFactor;
const calcY = (
  x: number,
  lx: number,
  containerCenterX: number,
  rotationFactor: number
) => (x - lx - containerCenterX) / rotationFactor;

const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

type FollowCursorProps = {
  children: ReactNode;
  className?: string;
  animationConfig?: object;
  hoverScale?: number;
  offsetX?: number;
  cardWidth?: string;
  rotationFactor?: number;
  perspective?: string;
  zoomSensitivity?: number;
  wheelConfig?: object;
  enableTilt?: boolean;
  enableZoom?: boolean;
  enableDrag?: boolean;
};

const FollowCursor = ({
  children,
  className = "",
  animationConfig = { mass: 5, tension: 350, friction: 40 },
  hoverScale = 1.1,
  offsetX = 20,
  cardWidth = "200px",
  rotationFactor = 20,
  perspective = "300px",
  zoomSensitivity = 200,
  wheelConfig = { mass: 1, tension: 200, friction: 30 },
  enableTilt = true,
  enableZoom = true,
  enableDrag = true,
}: FollowCursorProps) => {
  const domTarget = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchState = useRef<{
    startX?: number;
    startY?: number;
    offsetX?: number;
    offsetY?: number;
  }>({});

  const [{ x, y, rotateX, rotateY, rotateZ, zoom, scale }, api] = useSpring(
    () => ({
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      scale: 1,
      zoom: 0,
      x: 0,
      y: 0,
      config: animationConfig,
    })
  );

  const [{ wheelY }, wheelApi] = useSpring(() => ({
    wheelY: 0,
    config: wheelConfig,
  }));

  useEffect(() => {
    if (!isMobile() || !domTarget.current || !enableDrag) return;

    const card = domTarget.current;
    let isDragging = false;
    let pinchStartDistance = 0;
    let pinchStartAngle = 0;
    let initialZoom = 0;
    let initialRotateZ = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchState.current = {
          startX: e.touches[0].clientX,
          startY: e.touches[0].clientY,
          offsetX: x.get(),
          offsetY: y.get(),
        };
        isDragging = true;
      } else if (e.touches.length === 2 && enableZoom) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        pinchStartDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        pinchStartAngle = Math.atan2(
          touch2.clientY - touch1.clientY,
          touch2.clientX - touch1.clientX
        );
        initialZoom = zoom.get();
        initialRotateZ = rotateZ.get();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging && e.touches.length !== 2) return;

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - (touchState.current.startX ?? 0);
        const deltaY = touch.clientY - (touchState.current.startY ?? 0);

        api.start({
          x: (touchState.current.offsetX ?? 0) + deltaX,
          y: (touchState.current.offsetY ?? 0) + deltaY,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
        });
      }
    };

    card.addEventListener("touchstart", handleTouchStart, { passive: false });
    card.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      card.removeEventListener("touchstart", handleTouchStart);
      card.removeEventListener("touchmove", handleTouchMove);
    };
  }, [api, x, y, zoom, rotateZ, enableDrag, enableZoom]);

  const wheelTransform = (y: number) => {
    const imgHeight = containerRef.current
      ? containerRef.current.offsetWidth * (parseFloat(cardWidth) / 100) - 20
      : window.innerWidth * 0.3 - 20;
    return `translateY(${
      -imgHeight * (y < 0 ? 6 : 1) - (y % (imgHeight * 5))
    }px`;
  };

  return (
    <div className={`container ${className}`} ref={containerRef}>
      <animated.div
        ref={domTarget}
        className="relative w-[180px] h-[150px] bg-cover bg-[url('https://res.cloudinary.com/practicaldev/image/fetch/s--8mUhEkXE--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_66%2Cw_800/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/km2w1ppw3yw9pd9na7mu.gif')] rounded-[15px] shadow-lg transition-opacity duration-500 touch-none"
        style={{
          width: cardWidth,
          transform: `perspective(${perspective})`,
          ...{
            x,
            y,
            scale: to([scale, zoom], (s: number, z: number) => s + z), // Explicitly typing `s` and `z`
            rotateX: enableTilt ? rotateX : 0,
            rotateY: enableTilt ? rotateY : 0,
            rotateZ: enableZoom ? rotateZ : 0,
          },
        }}
      >
        <animated.div style={{ transform: wheelY.to(wheelTransform) }}>
          {children}
        </animated.div>
      </animated.div>
    </div>
  );
};

export default FollowCursor;
