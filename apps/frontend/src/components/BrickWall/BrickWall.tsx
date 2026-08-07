"use client";

import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import ProjectBrick from "@/components/ProjectBrick/ProjectBrick";
import { fetchProjects, type Project } from "@/lib/api";
import styles from "./BrickWall.module.scss";

const wallVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const brickVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

export default function BrickWall() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchProjects()
      .then((data) => {
        if (!cancelled) setProjects(data);
      })
      .catch(() => {
        // Errors are intentionally swallowed for now; the empty state below
        // covers both "no projects yet" and "API unreachable".
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="projects" className={styles.wall}>
      {isLoading && <p className={styles.status}>Замешиваем раствор...</p>}

      {!isLoading && projects.length === 0 && (
        <p className={styles.status}>Кирпичей пока нет.</p>
      )}

      {projects.length > 0 && (
        <motion.div
          className={styles.grid}
          variants={wallVariants}
          initial="hidden"
          animate="visible"
        >
          {projects.map((project, index) => (
            <motion.div key={project.id} variants={brickVariants}>
              <ProjectBrick project={project} priority={index === 0} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
