# Centering stuff in phaser

https://www.stephengarside.co.uk/blog/phaser-3-center-text-in-middle-of-screen/

```js
const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2
const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2
const loadingText = this.add.text(screenCenterX, screenCenterY, 'Loading: 0%').setOrigin(0.5)
```