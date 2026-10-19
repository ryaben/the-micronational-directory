function motionIsReduced() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export function positionLeavingDirectoryCard(element) {
  if (motionIsReduced()) return;

  const parent = element.parentElement;
  if (!parent) return;

  if (parent.__directoryCardSnapshotTaken) return;
  parent.__directoryCardSnapshotTaken = true;

  const parentRect = parent.getBoundingClientRect();
  Array.from(parent.children).forEach(card => {
    const cardRect = card.getBoundingClientRect();
    card.__directoryCardPosition = {
      left: `${cardRect.left - parentRect.left - parent.clientLeft + parent.scrollLeft}px`,
      top: `${cardRect.top - parentRect.top - parent.clientTop + parent.scrollTop}px`,
      width: `${cardRect.width}px`
    };
  });

  requestAnimationFrame(() => {
    parent.__directoryCardSnapshotTaken = false;
  });
}

function anchorLeavingDirectoryCard(element) {
  const position = element.__directoryCardPosition;
  if (!position) return;

  Object.assign(element.style, {
    position: 'absolute',
    left: position.left,
    top: position.top,
    width: position.width,
    boxSizing: 'border-box',
    margin: '0',
    zIndex: '1',
    pointerEvents: 'none'
  });
}

function animate(element, frames, duration, done) {
  if (motionIsReduced() || typeof element.animate !== 'function') {
    done();
    return;
  }

  const animation = element.animate(frames, {
    duration,
    easing: 'cubic-bezier(0.22, 0.75, 0.25, 1)',
    fill: 'both'
  });
  let completed = false;
  const finish = () => {
    if (completed) return;
    completed = true;
    animation.cancel();
    done();
  };

  animation.onfinish = finish;
  animation.oncancel = () => {
    if (!completed) {
      completed = true;
      done();
    }
  };
}

export function animateDirectoryCardEnter(element, done) {
  animate(element, [
    { opacity: 0, transform: 'translateY(12px) scale(0.985)' },
    { opacity: 1, transform: 'translateY(0) scale(1)' }
  ], 340, done);
}

export function animateDirectoryCardLeave(element, done) {
  if (!motionIsReduced()) anchorLeavingDirectoryCard(element);
  animate(element, [
    { opacity: 1, transform: 'translateY(0) scale(1)' },
    { opacity: 0, transform: 'translateY(-7px) scale(0.99)' }
  ], 260, done);
}
