export function generateLSystem(axiom, rules, iterations) {
    let current = axiom;

    for(let i = 0; i < iterations; i++) {
        let next = '';
        for(let char of current)
            next += rules[char] || char;
        current = next;
    }

    return current;
}

export function interpretLSystem(instructions, angle, step = 10) {
    const radians = (degrees) => (degrees * Math.PI) / 180;
    let pos = {x: 0, y: 0};
    let currentAngle = -90;
    let stack = [];
    let branches = [];
    let flowers = [];
    let leaves = [];

    for(let char of instructions) {
        switch(char) {
            case 'G':
                const newPos = {
                    x: pos.x + step * Math.cos(radians(currentAngle)),
                    y: pos.y + step * Math.sin(radians(currentAngle))
                };

                if (isFinite(pos.x) && isFinite(pos.y) && isFinite(newPos.x) && isFinite(newPos.y))
                    branches.push({x1: pos.x, y1: pos.y, x2: newPos.x, y2: newPos.y});
                else
                    console.warn('Invalid line coordinates:', {
                        pos, newPos, angle: currentAngle
                    });

                pos = newPos;
                break;
            case 'F':
                flowers.push({x: pos.x, y: pos.y, angle: currentAngle});
                break;
            case 'L':
                leaves.push({x: pos.x, y: pos.y, angle: currentAngle});
                break;
            case '+':
                currentAngle += angle;
                break;
            case '-':
                currentAngle -= angle;
                break;
            case '[':
                stack.push({pos: {...pos}, stateAngle: currentAngle});
                break;
            case ']':
                if (stack.length > 0) {
                    const saved = stack.pop();
                    if (saved) {
                        pos = saved.pos;
                        currentAngle = saved.stateAngle;
                    }
                }
                break;
        }
    }
    
    return {branches, flowers, leaves};
}