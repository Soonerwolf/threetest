export class SimpleTest
{
    constructor(inContainer)
    {
        this.container = inContainer;
    }
    
    draw ()
    {
        this.container.innerHTML = "Success!"
    }
}