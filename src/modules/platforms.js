import { $timeRatio, player, platforms, transform, resetDash } from '../state';
import {
  vector,
  approach,
  getObjectBoundary,
  collision,
  vectorOp,
} from '../utils';
import {
  SIDE_T,
  SIDE_B,
  SIDE_L,
  SIDE_R,
  GROUND_FRICTION,
  WALL_FRICTION,
  PLATFORM_TYPE_STANDARD,
  PLATFORM_TYPE_X_FOLLOW_PLAYER,
  KEY_PLATFORM_TYPE,
} from '../constants';

function handleCollision(type, platform, platformBoundary, collidedSide) {
  if(type === PLATFORM_TYPE_STANDARD) {
    standard(platform, platformBoundary, collidedSide);
  } else if(type === PLATFORM_TYPE_X_FOLLOW_PLAYER) {
    platform.p.x = player.p.x;
    standard(platform, platformBoundary, collidedSide);
  }
}

function standard(platform, platformBoundary, collidedSide) {
  const playerBoundary = getObjectBoundary(player);
  if(collidedSide === SIDE_T) resetDash();
  if (
    (collidedSide === SIDE_B || collidedSide === SIDE_T) && 
    playerBoundary.l < platformBoundary.r - 1 &&
    playerBoundary.r > platformBoundary.l + 1
  ) {
    player.v.y = platform.v.y;
    player.p.y =
      platformBoundary[collidedSide] +
      (player.s.y / 2) * (collidedSide === SIDE_T ? 1 : -1);
    player.v.x = approach(
      player.v.x,
      platform.v.x,
      (platform.v.x - player.v.x) * GROUND_FRICTION * $timeRatio.$
    )
  } else if (collidedSide === SIDE_L || collidedSide === SIDE_R) {
    resetDash();
    player.v.x = platform.v.x;
    player.p.x =
      platformBoundary[collidedSide] +
      (player.s.x / 2 - 1) * (collidedSide === SIDE_R ? 1 : -1);
    player.v.y = approach(
      player.v.y,
      platform.v.y,
      (platform.v.y - player.v.y) * WALL_FRICTION * $timeRatio.$
    );
  }
}

export default (ctx) => {
  platforms.map(platform => {
    // platform movement
    vectorOp((pos, v) => pos + v  * $timeRatio.$, [platform.p, platform.v], platform.p);
    
    // platform collision
    const platformBoundary = getObjectBoundary(platform);
    const collidedSide = collision(player, platform, $timeRatio.$);
    handleCollision(platform[KEY_PLATFORM_TYPE], platform, platformBoundary, collidedSide);
    
    // draw platform
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(
      ...transform(vector(platformBoundary.l, platformBoundary.t)),
      transform(platform.s.x),
      transform(platform.s.y)
    );
  });
}