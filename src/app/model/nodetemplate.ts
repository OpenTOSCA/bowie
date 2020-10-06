export class NodeTemplate {
    public properties: string[] = [];

    constructor(public id: string,
                public name: string,
                public type: string,
                public namespace: string) {
    }
}