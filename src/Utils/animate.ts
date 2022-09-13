/**
 * https://www.stephengarside.co.uk/blog/phaser-3-flashing-text-easy-example/
 */
export default class TweenHelper {
  static flashElement(scene, element, repeat = true, easing = 'Linear', overallDuration = 1200, visiblePauseDuration = 300) {
    if (scene && element) {
      const flashDuration = overallDuration - visiblePauseDuration / 2

      scene.tweens.timeline({
        tweens: [
          {
            targets: element,
            duration: 0,
            alpha: 0.3,
            ease: easing,
          },
          {
            targets: element,
            duration: flashDuration,
            alpha: 1,
            ease: easing,
          },
          {
            targets: element,
            duration: visiblePauseDuration,
            alpha: 1,
            ease: easing,
          },
          {
            targets: element,
            duration: flashDuration,
            alpha: 0.3,
            ease: easing,
            onComplete: () => {
              if (repeat === true)
                this.flashElement(scene, element)
            },
          },
        ],
      })
    }
  }
}
