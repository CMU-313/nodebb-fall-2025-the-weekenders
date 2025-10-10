'use strict';

const assert = require('assert');

// Unit tests for the anonymous front-end masking helper
const anon = require('../../src/topics/anonymous');

describe('topics/anonymous helper', () => {
  it('toBoolean handles truthy variants', () => {
    assert.strictEqual(anon.toBoolean(true), true);
    assert.strictEqual(anon.toBoolean(1), true);
    assert.strictEqual(anon.toBoolean('1'), true);
  });

  it('toBoolean handles falsy variants', () => {
    assert.strictEqual(anon.toBoolean(false), false);
    assert.strictEqual(anon.toBoolean(0), false);
    assert.strictEqual(anon.toBoolean('0'), false);
    assert.strictEqual(anon.toBoolean(undefined), false);
    assert.strictEqual(anon.toBoolean(null), false);
  });

  it('applyAnonymousMask leaves non-anonymous posts unchanged', () => {
    const post = { uid: 5, isAnonymous: 0, user: { username: 'Alice' }, userslug: 'alice' };
    anon.applyAnonymousMask(post, 2, false);
    assert.strictEqual(post.uid, 5);
    assert.strictEqual(post.user.username, 'Alice');
    assert.strictEqual(post.userslug, 'alice');
  });

  it('applyAnonymousMask hides identity from other regular viewers', () => {
    const post = { uid: 7, isAnonymous: 1, user: { username: 'Bob' }, userslug: 'bob' };
    anon.applyAnonymousMask(post, 99, false);
    assert.strictEqual(post.uid, 0);
    assert.strictEqual(post.user.username, 'Anonymous');
    assert.strictEqual(post.userslug, undefined);
  });

  it('applyAnonymousMask does not mask for staff viewers', () => {
    const post = { uid: 7, isAnonymous: 1, user: { username: 'Bob' }, userslug: 'bob' };
    anon.applyAnonymousMask(post, 42, true);
    assert.strictEqual(post.uid, 7);
    assert.strictEqual(post.user.username, 'Bob');
  });

  it('applyAnonymousMask does not mask for the author (self)', () => {
    const post = { uid: 10, isAnonymous: 1, user: { username: 'Carol' }, userslug: 'carol' };
    anon.applyAnonymousMask(post, 10, false);
    assert.strictEqual(post.uid, 10);
    assert.strictEqual(post.user.username, 'Carol');
  });
});

