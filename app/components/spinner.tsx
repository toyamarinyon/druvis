import { animate, motion, motionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

const primitives = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
export const Spinner = () => {
	const motionIndex = motionValue(0);
	const showPrimitive = useTransform(
		motionIndex,
		(value) => primitives[Math.floor(value)],
	);

	useEffect(() => {
		animate(motionIndex, primitives.length, {
			duration: 1,
			ease: "linear",
			repeat: Number.POSITIVE_INFINITY,
		});
	}, [motionIndex]);
	return <motion.span>{showPrimitive}</motion.span>;
};
