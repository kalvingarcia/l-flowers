import React, {useState} from 'react';
import {tss} from './common/theme';
import {generateLSystem, interpretLSystem} from '../l-system';
import LSystemRenderer from './l-system-renderer';
import ControlPanel from './control-panel';

const useStyles = tss.create(({theme}) => ({
    content: {
        width: "100%",
        height: "100%",
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
    const axiom = 'SB';

    const [angle, setAngle] = useState(30);
    const [iterations, setIterations] = useState(6);
    const [step, setStep] = useState(8);

    const instructions = generateLSystem(axiom, rules, iterations);

    const {classes} = useStyles({});
    return (
        <div className={classes.content}>
            <ControlPanel angle={angle} setAngle={setAngle} iterations={iterations} setIterations={setIterations} step={step} setStep={setStep} />
            <LSystemRenderer {...interpretLSystem(instructions, angle, step)} />
        </div>
    );
}
