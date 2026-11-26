---
name: motion-graphic-skill
description: HyperFrames로 30초 안팎의 모션그래픽 인트로 영상을 만든다. 녹화 영상의 컷과 자막이 이미 있거나, 글과 도형만으로 짧은 모션을 만들 때 쓴다. 장면 기획, HTML 작성, 검사, 프레임 확인, 렌더까지 한 흐름이다.
---

# 모션그래픽 인트로 스킬

HyperFrames(HTML을 영상으로 렌더하는 도구)만 쓴다. 다른 도구는 필요 없다. 공식 `hyperframes` 스킬이 이미 설치돼 있으면 그 문서를 먼저 읽고, 없어도 아래 규칙만으로 동작한다.

## 만들 것

- 길이 30초 안팎, 1920x1080, 30fps인 영상 하나.
- 글자 몇 개와 도형이 위치와 크기로 움직이는 장면 3~5개.
- 인트로는 첫 3초 안에 "이 영상이 무엇을 주는지"가 글자로 읽혀야 한다.

## 작업 순서

1. 요청 확인. 주제 한 줄, 총 길이, 화면 비율, 쓸 글자(제목과 핵심 낱말 3개 이하)를 정한다. 말해 주지 않은 값은 기본값(30초, 1920x1080, 한글 제목 1개)으로 두고 진행한다.
2. 프로젝트 만들기. 빈 폴더에서 `npx hyperframes init motion-intro` 를 실행하고 그 폴더에서 작업한다. 이미 있으면 그대로 이어 쓴다.
3. 장면표 쓰기. `SCENES.md`에 장면마다 시작 초, 길이, 화면에 보이는 글자, 움직임 한 가지를 표로 적는다. 장면 길이 합이 전체 길이와 같아야 한다.
4. 장면 만들기. 장면 하나가 `compositions/` 아래 파일 하나다. 아래 "HyperFrames 규칙"을 지킨다.
5. 검사. `npx hyperframes check --json` 을 돌려 오류를 전부 고친다. 경고는 하나씩 읽고 이유가 있으면 둔다.
6. 프레임 확인. `npx hyperframes snapshot --review` 로 장면마다 프레임을 뽑아 직접 본다. 글자가 잘리거나 겹치면 고친다.
7. 렌더. `npx hyperframes render --quality looks --output out.mp4` (시험은 `draft`). 파일 크기가 0이 아니고 `ffprobe` 길이가 루트 `data-duration`과 맞는지 확인한다.
8. 영상 위에 얹기. 녹화 영상 위에 모션을 씌우려면 루트에 `<video>`를 깔고 모션 장면을 같은 시각에 맞춰 위 층에 둔다. 영상 소리는 `data-has-audio="true"` 로 살린다.

## HyperFrames 규칙 (어기면 렌더가 어긋난다)

- 시간이 있는 요소는 `class="clip"`, `data-start`, `data-duration`(초)을 가진다.
- 영상 길이는 루트의 `data-duration`이다.
- 장면 하나는 일시정지된 GSAP 타임라인 하나를 만들고 `window.__timelines["<composition-id>"] = tl` 로 등록한다. 트윈을 다 쓴 뒤에 등록한다.
- `Date.now()`, 시드 없는 `Math.random()`, 네트워크 요청, 타이머, 무한 반복(`repeat: -1`)을 쓰지 않는다. 화면의 모든 것은 타임라인 시간의 함수다.
- `.clip` 요소의 `display`, `visibility`를 트윈하지 않는다. 안쪽 자식을 움직인다.
- GSAP이 움직이는 요소에 CSS `transform`을 따로 걸지 않는다.
- 에셋 경로는 `assets/...` 로 쓰고 맨 앞에 `/`를 붙이지 않는다.
- 기본 내장 글꼴 말고 쓸 글꼴은 `@font-face`로 `assets/fonts/` 파일을 가리킨다.
- 장면 파일은 `<template>` 안에 스타일, 마크업, 스크립트를 두고 루트 요소를 `#root`로 스타일한다.
- 화면 내용은 가장자리에서 5% 안쪽(행동 안전 영역)에 둔다. 글자는 10% 안쪽에 둔다.

## 연출 원칙

- 한 장면에 한 생각이다. 글자 덩어리는 장면당 1개, 많아야 2개다.
- 등장과 퇴장은 위치, 크기, 선이 그려지는 길이로 만든다. 불투명도(opacity)를 서서히 바꾸는 방식은 쓰지 않는다. 바꿀 때는 즉시 교체한다.
- 움직임 하나는 0.3~0.6초, 이징은 `power3.out`, `power2.inOut` 중 하나로 통일한다. 튀어 오르는 이징은 쓰지 않는다.
- 색은 배경 1개, 글자 1개, 강조 1개만 쓴다. 강조색은 한 장면에서 한 곳에만 칠한다.
- 큰 글자는 화면 높이의 8% 이상, 설명 글자는 4% 이상이다.
- 한 번 정한 움직임 규칙(왼쪽에서 들어옴 등)은 모든 장면에서 같게 쓴다.
- 마지막 장면은 끝나기 0.5초 전에 최종 모양에 도착하고 그대로 멈춘다.

## 장면 틀 예시

```html
<template>
  <style>
    #root { position: relative; width: 1920px; height: 1080px; background: #101012; }
    .title { position: absolute; left: 160px; top: 420px; font: 700 140px "Pretendard", sans-serif; color: #f4f1ea; }
    .bar { position: absolute; left: 160px; top: 600px; width: 520px; height: 10px; background: #e8590c; transform-origin: 0 50%; }
  </style>
  <div id="root">
    <div class="title" id="t1">제목 글자</div>
    <div class="bar" id="b1"></div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.from("#t1", { y: 80, duration: 0.5, ease: "power3.out" }, 0.2);
    tl.from("#b1", { scaleX: 0, duration: 0.5, ease: "power2.inOut" }, 0.5);
    window.__timelines["scene-title"] = tl;
  </script>
</template>
```

## 끝내기 전 확인표

| 항목 | 통과 기준 |
| --- | --- |
| `hyperframes check` | 오류 0 |
| 렌더 파일 | 크기 > 0, 길이가 `data-duration`과 같음 |
| 첫 3초 | 주제 글자가 읽힘 |
| 글자 | 잘림과 겹침 0 |
| 불투명도 서서히 변화 | 0곳 |

`first_frame_empty` 경고는 첫 프레임이 배경뿐이라는 뜻이다. 첫 프레임에 제목이 있어야 하면 제목 시작 위치를 0초 화면 안에 두고 움직임은 그 뒤에 넣는다.
한글 글꼴이 렌더에서 안 잡히면 글꼴 파일(otf, ttf)을 `assets/fonts/`에 복사하고 `@font-face`로 연결한다.

막히면 오류 문장을 그대로 읽고 `Fix:` 줄을 따른다. 렌더가 오래 걸리면 `--quality draft` 로 줄여 확인한 뒤 최종만 `looks`로 돌린다.
