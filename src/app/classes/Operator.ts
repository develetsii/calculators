
class Operator {
    symbol: string;
    shownAs: string;
    verb: string;
    operate(a: number, b: number):number {
        return 0;
    }

    constructor(symbol: string, shownAs: string, verb: string, operate: (a: number, b: number) => number) {
        this.symbol = symbol;
        this.shownAs = shownAs;
        this.verb = verb;
        this.operate = operate;
    }
}

function createOperators() {
    return [
        new Operator('+', '+', 'sumar', (a, b) => a + b),
        new Operator('-', '-', 'restar', (a, b) => a - b),
        new Operator('*', 'x', 'multiplicar', (a, b) => a * b),
        new Operator('/', '/', 'dividir' ,(a, b) => a / b),
    ];
}

export type { Operator };
export { createOperators };