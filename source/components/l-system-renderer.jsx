import React from 'react';
import {tss} from './common/theme';
import {Circle, LinePath, Polygon} from '@visx/shape';
import Flower from '../../assets/flower.svg';
import Leaf from '../../assets/leaf.svg';

const useStyles = tss.create(({theme}) => ({
    branch: {
        stroke: theme.tertiary.onContainer.hex(),
        strokeWidth: 5,
        strokeBranchcap: "round",
    },
    petals: {
        fill: theme.error.container.hex(),
        stroke: theme.error.onContainer.hex(),
        strokeWidth: 10
    },
    middle: {
        fill: theme.neutral.containerHighest.hex(),
        stroke: theme.neutral.onContainer.hex(),
        strokeWidth: 1
    },
    leaf: {
        fill: theme.tertiary.container.hex(),
        stroke: theme.tertiary.onContainer.hex(),
        strokeWidth: 10
    }
}));

export default function LSystemRenderer({branches, flowers, leaves}) {
    const radians = (degrees) => (degrees * Math.PI) / 180;

    const {classes} = useStyles();
    return (
        <svg width={1000} height={1000}>
            {/* Branches */}
            {branches.map((branch, idx) => {
                if(isNaN(branch.x1) || isNaN(branch.x2) || isNaN(branch.y1) || isNaN(branch.y2))
                    console.warn('Invalid Data at index', idx, branch);
                return (
                    <LinePath 
                        className={classes.branch}
                        key={idx}
                        data={[
                            {x: branch.x1 + 500, y: 1000 - branch.y1},
                            {x: branch.x2 + 500, y: 1000 - branch.y2}
                        ]}
                        x={point => point.x}
                        y={point => point.y}
                    />
                );
            })}

            {/* Leaves */}
            {leaves.map((leaf, idx) => {
                return (
                    <g 
                        key={idx} 
                        transform={`
                            translate(${leaf.x + 500}, ${1000 - leaf.y})
                            rotate(${leaf.angle - 90})
                        `}
                    >
                        <Leaf
                            className={classes.leaf}
                            width={20}
                            x={-11 + 10 * Math.cos(radians(leaf.angle - 180))}
                            y={-510 + 10 * Math.sin(radians(leaf.angle - 180))} 
                        />
                    </g>
                )
            })}

            {/* Flowers */}
            {flowers.map((flower, idx) => {
                return (
                    <g 
                        key={idx} 
                        transform={`
                            translate(${flower.x + 500}, ${1000 - flower.y})
                            rotate(${flower.angle})
                        `}
                    >
                        <Flower className={classes.petals} width={35} x={-17} y={-500} />
                        <Circle className={classes.middle} cx={0} cy={0} r={4} />
                    </g>
                )
            })}
        </svg>
    );
}