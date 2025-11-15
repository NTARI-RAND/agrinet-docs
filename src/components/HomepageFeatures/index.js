import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

const FeatureList = [
  {
    title: "Connected Rural Communities",
    Svg: require("@site/static/img/agrinet_mountains.svg").default,
    description: (
      <>
        Agrinet delivers dependable last-mile connectivity so farmers,
        cooperatives, and agribusinesses can collaborate, share best practices,
        and access vital services in real time.
      </>
    ),
  },
  {
    title: "Actionable Farm Intelligence",
    Svg: require("@site/static/img/agrinet_computers.svg").default,
    description: (
      <>
        Integrate field data, weather insights, and market trends into a single
        Agrinet dashboard that helps stakeholders make faster, data-backed
        decisions that improve yields and resilience <code>docs</code>{" "}
        directory.
      </>
    ),
  },
  {
    title: "Resilient Digital Infrastructure",
    Svg: require("@site/static/img/agrinet_engine_scene.svg").default,
    description: (
      <>
        Agrinet combines scalable cloud services with edge-ready hardware to
        ensure reliable operations even in challenging environments, keeping
        agricultural networks running around the clock.
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx("col col--4", styles.featureColumn)}>
      <div className={styles.featureIllustrationWrapper}>
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className={clsx("text--center padding-horiz--md", styles.featureCopy)}>
        <Heading as="h3" className={styles.featureHeading}>
          {title}
        </Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
