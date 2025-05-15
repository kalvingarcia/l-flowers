import React from 'react';
import {tss} from './common/theme';
import {LinePath} from '@visx/shape';
import {curveBasisClosed} from '@visx/curve';
import {svgPathProperties} from 'svg-path-properties';

const useStyles = tss.create(({theme}) => ({
    renderer: {
        marginTop: "auto",
        width: "100%",
        height: "100%"
    },
    branch: {
        stroke: theme.tertiary.onContainer.hex(),
        strokeWidth: 5,
        strokeBranchcap: "round",
    },
    petals: {
        fill: theme.primary.container.hex(),
        stroke: theme.primary.onContainer.hex(),
        strokeWidth: 1
    },
    middle: {
        fill: theme.secondary.container.hex(),
        stroke: theme.secondary.onContainer.hex(),
        strokeWidth: 1
    },
    leaf: {
        fill: theme.tertiary.container.hex(),
        stroke: theme.tertiary.onContainer.hex(),
        strokeWidth: 1
    }
}));

const VIEWBOX_SIZE = 1000;
const FLOWER_PATH = "M186.55,430c-56.35-15.59-23.67-76.13-20.96-115.72c-16.17,22.75-21.94,57.06-46.96,72.24c-29.68,18.01-47.85,7.71-53.26-25.44c-13.05-6.77-28.27-1.63-29.5-21.33c-2.72-43.83,49.59-57.59,75.86-81.35c-36.64,14.68-146.13,22.39-98.77-46.5c0.87-10.7-24.25-20.64-5.61-41.93c20.32-23.2,65.86-15.63,91.41-6.37c-30.43-26.24-57.1-63.14-35.88-104.21c21.16-2.29,33.99-14.49,56.07-11.24c37.08,5.46,52.43,70.44,69.58,97.5C186.18,115.23,121.21-8.62,194.02,1c13.93,1.84,17.2,14.31,27.2,17.69c11.76,3.98,22.87-2.06,26.54,16.36c7.09,35.57-18.98,80.92-21.82,116.59c24.11-33.31,22.77-78.57,60.84-101.78c31.9-19.44,67.81-14.63,57.45,30.31c8.67,6.02,21.55,5.49,26.94,16.02c9.98,27.82-47.63,59.4-63.9,74.92c31-11.13,122.71-23.11,90.89,37.27l18.83,17.09v12.97c-31.08,52.26-97.38,20.74-142.66,10.99c25.42,26.14,87.65,30.01,87.26,74.79l-7.29,5.68c0.32,14.75-0.5,40.44-16.14,47.71c-6.56,3.05-16.37,3.03-22.64,6.29c-4.2,2.19-6.06,7.19-11.03,8.92c-43.56,15.12-63.46-75.67-79.03-101.49c3.48,47.89,32.11,109.55-23.96,138.67h-14.96L186.55,430z"
const LEAF_PATH = "M81.73,0c8.77,21.02,29.45,32.01,44.48,47.5,41.83,43.1,63.1,70.95,68.61,133.34,6.56,74.21-17.32,144.59-73.52,194.06l-5.96,71.15-7.17-3.71,4.42-69.07c-13.22-10.28-27.44-19.38-39.99-30.49-35.73-31.63-57.44-68.31-67.49-115.61-13.17-61.98.06-99.91,29.19-153.69C47.22,49.58,76.09,31.52,78.82,2.09l2.91-2.09Z";

function svgParser(pathString) {
    const properties = new svgPathProperties(pathString);
    const length = properties.getTotalLength();

    const points = [];
    for(let i = 0; i < length; i += 5) {
        const {x, y} = properties.getPointAtLength(i)
        points.push({x, y});
    }
    return points;
}

function scale(points, scale) {
    return points.map(({x, y}) => ({x: scale * x, y: scale * y}));
}

function rotate(points, angle) {
    const radians = (angle * Math.PI) / 180;

    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);

    const center = {
        x: (Math.min(...xs) + Math.max(...xs)) / 2,
        y: (Math.min(...ys) + Math.max(...ys)) / 2
    };

    return points.map(({x, y}) => {
        const dx = x - center.x;
        const dy = y - center.y;

        return {
            x: center.x + (dx * Math.cos(radians) - dy * Math.sin(radians)),
            y: center.y + (dx * Math.sin(radians) + dy * Math.cos(radians))
        };
    });
}

function translate(points, dx, dy) {
    return points.map(({x, y}) => ({x: dx + x, y: dy + y}));
}

export default function LSystemRenderer({branches, flowers, leaves}) {
    const flower_points = scale(svgParser(FLOWER_PATH), 480 / VIEWBOX_SIZE / 15);
    const leaf_points = scale(svgParser(LEAF_PATH), 480 / VIEWBOX_SIZE / 8);
    
    const {classes} = useStyles();
    return (
        <svg className={classes.renderer} viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`} preserveAspectRatio='xMidYMid meet'>
            {/* Branches */}
            {branches.map((branch, idx) => {
                if(isNaN(branch.x1) || isNaN(branch.x2) || isNaN(branch.y1) || isNaN(branch.y2))
                    console.warn('Invalid Data at index', idx, branch);
                return (
                    <LinePath 
                        key={idx}
                        className={classes.branch}
                        data={[
                            {x: branch.x1 + VIEWBOX_SIZE / 2, y: branch.y1 + VIEWBOX_SIZE},
                            {x: branch.x2 + VIEWBOX_SIZE / 2, y: branch.y2 + VIEWBOX_SIZE}
                        ]}
                        x={point => point.x}
                        y={point => point.y}
                    />
                );
            })}

            {/* Leaves */}
            {leaves.map((leaf, idx) => {
                return (
                    <LinePath
                        key={idx}
                        className={classes.leaf}
                        curve={curveBasisClosed}
                        data={translate(rotate(leaf_points, leaf.angle + 90), leaf.x + VIEWBOX_SIZE / 2 - 5, leaf.y + VIEWBOX_SIZE - 15)}
                        x={point => point.x}
                        y={point => point.y}
                    />
                )
            })}

            {/* Flowers */}
            {flowers.map((flower, idx) => {
                return (
                    <LinePath
                        key={idx}
                        className={classes.petals}
                        curve={curveBasisClosed}
                        data={translate(rotate(flower_points, flower.angle), flower.x + VIEWBOX_SIZE / 2 - 5, flower.y + VIEWBOX_SIZE - 10)}
                        x={point => point.x}
                        y={point => point.y}
                    />
                )
            })}
        </svg>
    );
}