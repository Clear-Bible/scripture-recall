import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const Loader = ({ message = "Loading..." }) => {
  return (
    <AnimatePresence>
      <motion.div
        className={"flex flex-col h-full w-full items-center justify-center"}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={{
          initial: { opacity: 0 },
          enter: { opacity: 1 },
          exit: { opacity: 0 },
        }}
      >
        <div className="flex grow flex-col justify-center items-center z-0">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">{message}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Loader;
