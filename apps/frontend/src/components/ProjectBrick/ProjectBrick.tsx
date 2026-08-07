import Image from "next/image";
import type { Project } from "@/lib/api";
import styles from "./ProjectBrick.module.scss";

interface ProjectBrickProps {
  project: Project;
  priority?: boolean;
}

export default function ProjectBrick({ project, priority = false }: ProjectBrickProps) {
  return (
    <article className={styles.brick}>
      <div className={styles.inner}>
        {project.coverUrl && (
          <div className={styles.cover}>
            <Image
              className={styles.image}
              src={project.coverUrl}
              alt={project.title}
              width={600}
              height={400}
              priority={priority}
              loading={priority ? undefined : "lazy"}
              unoptimized
            />
          </div>
        )}

        <div className={styles.body}>
          <h2 className={styles.title}>{project.title}</h2>
          <p className={styles.description}>{project.description}</p>

          {project.tags.length > 0 && (
            <ul className={styles.tags}>
              {project.tags.map((tag) => (
                <li key={tag} className={styles.tag}>
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}
