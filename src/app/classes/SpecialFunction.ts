
class SpecialFunction {
    math: string;
    shownAs: string;

    constructor(math: string, shownAs: string) {
        this.math = math;
        this.shownAs = shownAs;
    }
}

function createSpecialFunctions() {
    return [
        new SpecialFunction('Math.sqrt(', '√'),
        new SpecialFunction('Math.PI', 'π'),
        new SpecialFunction('Math.E', 'e'),
        new SpecialFunction('(', '('),
        new SpecialFunction(')', ')'),
        new SpecialFunction('%', '%'),
    ];
}

export type { SpecialFunction };
export { createSpecialFunctions };