import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

const NAV_ORDER = [
  "/",
  "/cycle",
  "/journal",
  "/movement",
  "/nutrition",
  "/nervous-system",
  "/practice",
  "/community",
  "/breathwork",
  "/modules",
  "/recommendations",
  "/account",
  "/coach",
  "/membership",
  "/auth",
];

function getDirection(from: string, to: string): 1 | -1 {
  const fromIdx = NAV_ORDER.findIndex((p) => from.startsWith(p) && p !== "/" ? true : from === p);
  const toIdx = NAV_ORDER.findIndex((p) => to.startsWith(p) && p !== "/" ? true : to === p);
  if (fromIdx === -1 || toIdx === -1) return 1;
  return toIdx > fromIdx ? 1 : -1;
}

const variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-30%" : "30%",
    opacity: 0,
  }),
};

interface Props {
  children: React.ReactNode;
  previousPath: string;
}

export default function PageTransition({ children, previousPath }: Props) {
  const location = useLocation();
  const direction = getDirection(previousPath, location.pathname);

  return (
    <AnimatePresence mode="popLayout" custom={direction}>
      <motion.div
        key={location.pathname}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: "spring", stiffness: 380, damping: 38 },
          opacity: { duration: 0.15 },
        }}
        style={{ position: "absolute", inset: 0, willChange: "transform" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
