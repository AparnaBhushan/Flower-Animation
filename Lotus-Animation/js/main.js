
const NS = "http://www.w3.org/2000/svg";

const centerX = 400;
const BLOOM_START = 11500;
const PETAL_DURATION = 4500;
const ARCH_DRAW_DURATION = 4000;
const VINE_STAGGER = 350;

const BUD_X = 400;
const BUD_Y = 350;

let budElement;

/* =========================================
   SVG HELPER
========================================= */

function createSVG(tag, attributes = {}) {
    const element = document.createElementNS(NS, tag);

    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });

    return element;
}

/* =========================================
   ANIMATION HELPERS
========================================= */

function easeInOut(t) {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(start, end, progress) {
    return start + (end - start) * progress;
}

/* =========================================
   GOLDEN ARCH
========================================= */

const vineConfigs = [
    { phase: 0, amplitude: 25, frequency: 5, offset: -8 },
    { phase: 1.7, amplitude: 21, frequency: 5.5, offset: 2 },
    { phase: 3.2, amplitude: 24, frequency: 4.5, offset: 9 },
    { phase: 4.8, amplitude: 19, frequency: 5.2, offset: -1 }
];

const ARCH_DRAW_COMPLETE =
    ARCH_DRAW_DURATION + VINE_STAGGER * (vineConfigs.length - 1);

function generateVine(config) {
    const radius = 375;
    const groundY = 618;
    const points = [];

    for (let i = 0; i <= 180; i++) {
        const t = Math.PI * i / 180;
        const wave =
            Math.sin(t * config.frequency * 2 + config.phase) *
            config.amplitude * Math.sin(t);

        const x = centerX - radius * Math.cos(t);
        const y = groundY - radius * Math.sin(t) + wave;

        points.push(`${i === 0 ? "M" : "L"} ${x} ${y}`);
    }

    return points.join(" ");
}

function drawVines() {
    const main = document.getElementById("main-vines");
    const glow = document.getElementById("background-glow");

    if (!main || !glow) return;

    vineConfigs.forEach((config, index) => {
        const pathData = generateVine(config);

        const glowPath = createSVG("path", {
            d: pathData,
            class: "glow-path"
        });

        const vine = createSVG("path", {
            d: pathData,
            class: "main-vine"
        });

        vine.style.animationDelay = `${index * VINE_STAGGER}ms`;

        glow.appendChild(glowPath);
        main.appendChild(vine);
    });
}

/* =========================================
   ARCH PARTICLES
========================================= */

function generateArchParticles() {
    const container = document.getElementById("particles");

    if (!container) return;

    for (let i = 0; i < 65; i++) {
        const particle = createSVG("circle", {
            cx: 85 + Math.random() * 630,
            cy: 90 + Math.random() * 340,
            r: 1 + Math.random() * 1.8,
            class: "particle"
        });

        particle.style.animationDelay = `${Math.random() * 4}s`;
        particle.style.animationDuration =
            `${2 + Math.random() * 3}s`;

        container.appendChild(particle);
    }
}

/* =========================================
   STEM AND LEAVES
========================================= */

function createStem() {
    const container = document.getElementById("lotus-stem");

    if (!container) return;

    const leftPad = createSVG("path", {
        d: `
            M 400 532
            C 358 492 270 482 205 523
            C 224 574 326 594 400 550
            C 380 546 365 539 354 530
            C 371 531 386 534 400 542 Z
        `,
        class: "lily-pad"
    });

    const rightPad = createSVG("path", {
        d: `
            M 400 532
            C 442 492 530 482 595 523
            C 576 574 474 594 400 550
            C 420 546 435 539 446 530
            C 429 531 414 534 400 542 Z
        `,
        class: "lily-pad"
    });

    const stem = createSVG("path", {
        d: "M 400 618 C 404 520 396 415 400 350",
        class: "stem"
    });
    stem.style.animationDelay = `${ARCH_DRAW_COMPLETE}ms`;

    const leftLeaf = createSVG("path", {
        d: `
            M 400 465
            C 365 443 330 449 315 475
            C 346 487 378 480 400 465 Z
        `,
        class: "lotus-leaf"
    });

    const rightLeaf = createSVG("path", {
        d: `
            M 400 465
            C 433 443 468 449 485 475
            C 452 487 423 480 400 465 Z
        `,
        class: "lotus-leaf"
    });

    leftLeaf.style.animationDelay = `${ARCH_DRAW_COMPLETE + 1000}ms`;
    rightLeaf.style.animationDelay = `${ARCH_DRAW_COMPLETE + 1000}ms`;
    leftPad.style.animationDelay = `${ARCH_DRAW_COMPLETE + 700}ms`;
    rightPad.style.animationDelay = `${ARCH_DRAW_COMPLETE + 700}ms`;

    container.append(leftPad, rightPad, stem, leftLeaf, rightLeaf);
}

/* =========================================
   CLOSED BUD
========================================= */

function createBud() {
    const container = document.getElementById("lotus-bud");

    if (!container) return;

    budElement = createSVG("path", {
        d: `
            M 400 350
            C 370 335 374 280 400 240
            C 426 280 430 335 400 350 Z
        `,
        class: "bud"
    });
    budElement.style.animationDelay = `${ARCH_DRAW_COMPLETE + 3000}ms`;

    container.appendChild(budElement);
}

/* =========================================
   PETAL SVG GEOMETRY
========================================= */

/*
   Petal geometry changes throughout the animation.

   A folded petal starts narrow and short.
   As it opens, its sides expand and its tip
   gradually reaches the final length.
*/

function getPetalPath(length, width, curl) {
    return `
        M 0 0

        C ${-width * 0.48} ${-length * 0.18},
          ${-width * 1.18} ${-length * 0.36},
          ${-width * 1.02} ${-length * 0.62}

        C ${-width * 0.92} ${-length * 0.86},
          ${-width * 0.30} ${-length * 0.98},
          0 ${-length * (1 + curl)}

        C ${width * 0.30} ${-length * 0.98},
          ${width * 0.92} ${-length * 0.86},
          ${width * 1.02} ${-length * 0.62}

        C ${width * 1.18} ${-length * 0.36},
          ${width * 0.48} ${-length * 0.18},
          0 0 Z
    `;
}

function getVeinPath(length, width) {
    return `
        M 0 -4
        C ${-width * 0.1} ${-length * 0.35},
          ${width * 0.1} ${-length * 0.7},
          0 ${-length * 0.96}
    `;
}

function getLeftShine(length, width) {
    return `
        M ${-width * 0.2} ${-length * 0.14}
        Q ${-width * 0.7} ${-length * 0.6}
          0 ${-length * 0.98}
    `;
}

function getRightShine(length, width) {
    return `
        M ${width * 0.2} ${-length * 0.14}
        Q ${width * 0.7} ${-length * 0.6}
          0 ${-length * 0.98}
    `;
}

/* =========================================
   ANIMATE INDIVIDUAL PETAL
========================================= */

function animatePetal(group, petal, startTime) {

    const duration = petal.duration || PETAL_DURATION;

    function frame(now) {
        const elapsed = now - startTime;

        if (elapsed < 0) {
            requestAnimationFrame(frame);
            return;
        }

        const rawProgress = Math.min(elapsed / duration, 1);
        const growthProgress = easeInOut(
            Math.min(rawProgress / 0.72, 1)
        );
        const openProgress = easeInOut(
            Math.max(0, Math.min((rawProgress - 0.18) / 0.82, 1))
        );

        /*
          Start close to the bud.
          The attachment point moves slightly
          as the petal opens to form a natural base.
        */

        const baseX = lerp(
            petal.startX,
            0,
            openProgress
        );

        const baseY = lerp(
            petal.startY,
            0,
            openProgress
        );

        // Let each petal rise from the bud before it folds outward.
        const length = lerp(10, petal.length, growthProgress);
        const width = lerp(2, petal.width, growthProgress);

        // The petal opens after it has started to grow.
        const angle = lerp(
            petal.startAngle || 0,
            petal.angle,
            openProgress
        );

        // Slight natural curve as the petal unfurls.
        const curl = lerp(
            0.01,
            petal.curl || 0.055,
            growthProgress
        );

        group.setAttribute(
            "transform",
            `translate(${baseX} ${baseY}) rotate(${angle})`
        );

        const path = group.querySelector(".petal-shape");
        const vein = group.querySelector(".petal-vein");
        const left = group.querySelector(".left-shine");
        const right = group.querySelector(".right-shine");

        path.setAttribute(
            "d",
            getPetalPath(length, width, curl)
        );

        vein.setAttribute(
            "d",
            getVeinPath(length, width)
        );

        left.setAttribute(
            "d",
            getLeftShine(length, width)
        );

        right.setAttribute(
            "d",
            getRightShine(length, width)
        );

        group.style.opacity = Math.min(rawProgress * 3, 1);

        if (rawProgress < 1) {
            requestAnimationFrame(frame);
        } else {
            group.style.opacity = "1";
        }
    }

    requestAnimationFrame(frame);
}

/* =========================================
   CREATE PETAL
========================================= */

function createPetal(petal) {
    const container = document.getElementById(
        petal.type === "front" && Math.abs(petal.startX) <= 2
            ? "petal-foreground"
            : "petals"
    );

    const group = createSVG("g");

    group.style.opacity = "0";

    const path = createSVG("path", {
        class: `petal petal-shape ${petal.type}`,
        fill: `url(#${petal.gradient})`
    });

    const vein = createSVG("path", {
        class: "petal-vein"
    });

    const leftShine = createSVG("path", {
        class: "petal-shine left-shine"
    });

    const rightShine = createSVG("path", {
        class: "petal-shine right-shine"
    });

    group.append(path, vein, leftShine, rightShine);

    // Append in layer order.
    container.appendChild(group);

    const startTime =
        performance.now() + BLOOM_START + petal.delay;

    animatePetal(group, petal, startTime);
}

/* =========================================
   LOTUS BLOOM SEQUENCE
========================================= */

function createNaturalLotus() {

    const petals = [

        /*
          STAGE 1: BACK PETALS

          A low fan of long petals forms the outer
          silhouette before the inner cup appears.
        */

        {
            startX: -5, startY: 0,
            baseX: -18, baseY: 2,
            startAngle: 0, angle: -94,
            length: 205, width: 36,
            type: "outer",
            gradient: "outerPetal",
            delay: 0
        },

        {
            startX: -3, startY: -2,
            baseX: -12, baseY: -8,
            startAngle: 0, angle: -48,
            length: 112, width: 38,
            type: "outer",
            gradient: "outerPetal",
            delay: 700
        },

        {
            startX: -1, startY: -2,
            baseX: -5, baseY: -13,
            startAngle: 0, angle: -18,
            length: 98, width: 38,
            type: "outer",
            gradient: "outerPetal",
            delay: 1400
        },

        {
            startX: 1, startY: -2,
            baseX: 5, baseY: -13,
            startAngle: 0, angle: 18,
            length: 98, width: 38,
            type: "outer",
            gradient: "outerPetal",
            delay: 1800
        },

        {
            startX: 3, startY: -2,
            baseX: 12, baseY: -8,
            startAngle: 0, angle: 48,
            length: 112, width: 38,
            type: "outer",
            gradient: "outerPetal",
            delay: 2200
        },

        {
            startX: 5, startY: 0,
            baseX: 18, baseY: 2,
            startAngle: 0, angle: 94,
            length: 205, width: 36,
            type: "outer",
            gradient: "outerPetal",
            delay: 0
        },

        /*
          STAGE 2: SECOND LAYER

          Side petals angle out and slightly down,
          creating the broad, shallow lotus bowl.
        */

        {
            startX: -5, startY: 2,
            baseX: -20, baseY: 8,
            startAngle: 0, angle: -76,
            length: 195, width: 40,
            type: "middle",
            gradient: "middlePetal",
            delay: 0
        },

        {
            startX: -4, startY: 4,
            baseX: -16, baseY: 20,
            startAngle: 0, angle: -104,
            length: 170, width: 42,
            type: "middle",
            gradient: "middlePetal",
            delay: 3900
        },

        {
            startX: 5, startY: 2,
            baseX: 20, baseY: 8,
            startAngle: 0, angle: 76,
            length: 195, width: 40,
            type: "middle",
            gradient: "middlePetal",
            delay: 0
        },

        {
            startX: 4, startY: 4,
            baseX: 16, baseY: 20,
            startAngle: 0, angle: 104,
            length: 170, width: 42,
            type: "middle",
            gradient: "middlePetal",
            delay: 5300
        },

        /*
          STAGE 3: INNER PETALS

          These rise around the luminous centre
          to create the more upright inner cup.
        */

        {
            startX: -4, startY: 0,
            baseX: -16, baseY: -2,
            startAngle: 0, angle: -30,
            length: 88, width: 36,
            type: "inner",
            gradient: "innerPetal",
            delay: 6100
        },

        {
            startX: -2, startY: -2,
            baseX: -7, baseY: -9,
            startAngle: 0, angle: -10,
            length: 100, width: 38,
            type: "inner",
            gradient: "innerPetal",
            delay: 6800
        },

        {
            startX: 2, startY: -2,
            baseX: 7, baseY: -9,
            startAngle: 0, angle: 10,
            length: 100, width: 38,
            type: "inner",
            gradient: "innerPetal",
            delay: 7500
        },

        {
            startX: 4, startY: 0,
            baseX: 16, baseY: -2,
            startAngle: 0, angle: 30,
            length: 88, width: 36,
            type: "inner",
            gradient: "innerPetal",
            delay: 8200
        },

        /*
          STAGE 4: FRONT PETALS

          These unfold last, curving down and out
          to form the soft front edge of the bloom.
        */

        {
            startX: -4, startY: 3,
            baseX: -30, baseY: 12,
            startAngle: 0, angle: -100,
            length: 145, width: 38,
            type: "front",
            gradient: "frontPetal",
            delay: 9200
        },

        {
            startX: -2, startY: 4,
            baseX: -12, baseY: 18,
            startAngle: 0, angle: -108,
            length: 118, width: 40,
            type: "front",
            gradient: "frontPetal",
            delay: 9900
        },

        {
            startX: 4, startY: 3,
            baseX: 30, baseY: 12,
            startAngle: 0, angle: 100,
            length: 145, width: 38,
            type: "front",
            gradient: "frontPetal",
            delay: 10600
        },

        {
            startX: 2, startY: 4,
            baseX: 12, baseY: 18,
            startAngle: 0, angle: 108,
            length: 118, width: 40,
            type: "front",
            gradient: "frontPetal",
            delay: 11300
        }
    ];

    const rearFanAngles = [-132, -108, -84, -60, -36, 36, 60, 84, 108, 132];
    const rearFan = rearFanAngles.map((angle, index) => ({
        startX: (index - 4.5) * 0.6,
        startY: -1,
        baseX: (index - 4.5) * 3.2,
        baseY: -5,
        startAngle: 0,
        angle,
        length: Math.abs(angle) > 100 ? 122 : 140,
        width: 25,
        type: "outer",
        gradient: "outerPetal",
        delay: 500 + index * 280
    }));

    petals.unshift(...rearFan);

    petals.forEach(petal => createPetal(petal));

    const bloomDuration = Math.max(
        ...petals.map(petal => petal.delay + (petal.duration || PETAL_DURATION))
    );

    // Keep the bud visible until the final petals have opened.
    setTimeout(() => {
        if (budElement) {
            budElement.classList.add("fade");
        }
    }, BLOOM_START + bloomDuration);

    setTimeout(fadeArchAway, BLOOM_START + bloomDuration + 1000);
}

/* =========================================
   GOLDEN LOTUS CENTRE
========================================= */

function createLotusCentre() {
    const container = document.getElementById("lotus-centre");

    const halo = createSVG("circle", {
        cx: 400,
        cy: 334,
        r: 42,
        class: "core-halo"
    });

    const core = createSVG("circle", {
        cx: 400,
        cy: 334,
        r: 24,
        class: "core"
    });

    const crown = createSVG("path", {
        d: `
            M 379 340
            L 383 321
            L 392 331
            L 400 311
            L 408 331
            L 417 321
            L 421 340
            Q 400 351 379 340 Z
        `,
        class: "core-crown"
    });

    container.append(halo, core, crown);

    for (let i = 0; i < 22; i++) {
        const angle = (Math.PI * 2 * i) / 22;
        const radius = 16 + Math.random() * 10;

        const stamen = createSVG("circle", {
            cx: 400 + Math.cos(angle) * radius,
            cy: 334 + Math.sin(angle) * radius,
            r: 1.5 + Math.random() * 1.5,
            class: "stamen"
        });

        container.appendChild(stamen);
    }

    setTimeout(() => {
        halo.style.transition = "opacity 2s ease";
        core.style.transition = "opacity 2s ease";

        halo.style.opacity = "0.9";
        core.style.opacity = "1";
        crown.style.transition = "opacity 1.2s ease";
        crown.style.opacity = "1";

        container.querySelectorAll(".stamen").forEach((stamen, index) => {
            setTimeout(() => {
                stamen.style.transition = "opacity 0.8s ease";
                stamen.style.opacity = "1";
            }, index * 70);
        });
    }, BLOOM_START + 12500);
}

/* =========================================
   FLOWER SPARKLES
========================================= */

function createFlowerSparkles() {
    const container = document.getElementById("flower-particles");

    for (let i = 0; i < 40; i++) {
        const sparkle = createSVG("circle", {
            cx: 160 + Math.random() * 480,
            cy: 110 + Math.random() * 330,
            r: 1 + Math.random() * 2,
            class: "flower-sparkle"
        });

        sparkle.style.animationDelay = `${Math.random() * 4}s`;
        sparkle.style.animationDuration =
            `${1.5 + Math.random() * 3}s`;

        container.appendChild(sparkle);
    }
}

/* =========================================
   FADE GOLDEN ARCH
========================================= */

function fadeArchAway() {
    [
        "background-glow",
        "main-vines",
        "particles"
    ].forEach(id => {
        const element = document.getElementById(id);

        if (element) {
            element.classList.add("arch-hidden");
        }
    });
}

/* =========================================
   START ANIMATION
========================================= */

function startAnimation() {
    drawVines();
    generateArchParticles();

    createStem();
    createBud();

    createNaturalLotus();
    createLotusCentre();
    createFlowerSparkles();

}

startAnimation();
