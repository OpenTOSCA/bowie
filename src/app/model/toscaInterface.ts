import { Parameter } from './parameter';

export class Operation {
    name: string;
    inputParameters: {
        inputParameter: Parameter[]
    };
    outputParameters: {
        outputParameter: Parameter[]
    };
}

export class ToscaInterface {
    name: string;
    operation: Operation[];
}