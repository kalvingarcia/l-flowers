import React from 'react';
import {tss} from './common/theme';
import {generateLSystem, interpretLSystem} from '../l-system';
import LSystemRenderer from './l-system-renderer';

const useStyles = tss.create(({theme}) => ({
    content: {
        display: "flex",
        flexDirection: "column",
        alignContent: "center",
        minHeight: "100%"
    }
}));

export default function Layout({}) {
    /**
     * S: shoots
     * B: buds (shoots w/ flowers)
     * G: growth (lines)
     * F: flower
     * L: leaf
     */
    const rules = {
        S: 'G[+[+LB]GS][-[GS]-LB]',
        B: 'GF[+SL]-BF',
        G: 'GG',
        F: 'F',
        L: 'L'
    };

    const axiom = 'S';
    const angle = 25;
    const iterations = 5;
    const step = 10;

    const instructions = generateLSystem(axiom, rules, iterations);

    const {classes} = useStyles({});
    return (
        <LSystemRenderer {...interpretLSystem(instructions, angle, step)} />
    );
}
