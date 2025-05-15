import React from 'react';
import {tss} from './common/theme';
import {Heading} from './common/typography';
import TextField from './common/text-field';

const useStyles = tss.create(({theme}) => ({
    controlPanel: {
        display: "flex",
        flexDirection: "column",
        margin: "5%",
        marginBottom: "auto",
        marginLeft: "auto",
        marginRight: "auto",
        width: "80%",
        maxWidth: "400px",
        height: "50%",
        maxHeight: "400px",
        padding: "40px",
        borderRadius: "20px",
        border: `1pt solid ${theme.neutral.onContainer.alpha(0.5).hexa()}`,
        backgroundColor: theme.neutral.container.hex()
    }
}));

export default function ControlPanel({angle, setAngle, iterations, setIterations, step, setStep}) {
    const {classes} = useStyles({});
    return (
        <div className={classes.controlPanel}>
            <Heading>L-System Flowers</Heading>
            <TextField label="Angle" value={angle} onChange={(text) => setAngle(parseInt(text))} />
            <TextField label="Iterations" value={iterations} onChange={(text) => setIterations(parseInt(text))} />
            <TextField label="Steo" value={step} onChange={(text) => setStep(parseInt(text))} />
        </div>
    )
}