import Link from "next/link";
import { homeAiInfraRow, homeDatabaseEngineRow } from "@/lib/homeLandingSections";
import {
  homeLandingCardClass,
  homeLandingDescriptionClass,
  homeLandingMainClass,
  homeLandingPageClass,
  homeLandingTitleClass,
} from "@/lib/homeLandingRowStyles";

export default function Home() {
  return (
    <div className={homeLandingPageClass}>
      <main className={homeLandingMainClass}>
        <Link
          href={homeDatabaseEngineRow.href}
          className={homeLandingCardClass({ interactive: true })}
        >
          <div className={homeLandingTitleClass}>{homeDatabaseEngineRow.title}</div>
          <p className={homeLandingDescriptionClass}>{homeDatabaseEngineRow.description}</p>
        </Link>

        <section
          className={homeLandingCardClass({ interactive: false })}
          aria-label={homeAiInfraRow.title}
        >
          <div className={homeLandingTitleClass}>{homeAiInfraRow.title}</div>
          <p className={homeLandingDescriptionClass}>{homeAiInfraRow.description}</p>
        </section>
      </main>
    </div>
  );
}
