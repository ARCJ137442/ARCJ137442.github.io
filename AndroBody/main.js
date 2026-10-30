"use strict";

const stageDetails = {
  theory: {
    kicker: "保持地图开放",
    title: "理论上可能，不代表已实现",
    body: "Android API、系统组件、设备硬件和授权桥提供候选路径。AndroBody 保留这些可能性，再逐项核对可行条件。",
    state: "THEORETICAL ≠ AVAILABLE",
  },
  feasibility: {
    kicker: "按当前设备核对",
    title: "权限与设备条件要有来源",
    body: "系统版本、应用身份、硬件与用户授权分别检查。没有当前证据时，状态保持未知或待验证。",
    state: "DEVICE · PERMISSION · TARGET",
  },
  attempt: {
    kicker: "真实调用才算尝试",
    title: "派发、受理与结果分开记录",
    body: "工具调用关联同一 request 和 trace。超时或取消不会自动重放可能有副作用的动作。",
    state: "ATTEMPT ≠ COMPLETION",
  },
  result: {
    kicker: "证据决定结论",
    title: "有回执才报告到达阶段",
    body: "系统接受、目标应用回执和独立读回各自记录。缺少独立证据时不推断设备效果。",
    state: "RECEIPT · OBSERVATION · UNKNOWN",
  },
};

const buttons = [...document.querySelectorAll(".stage-button")];
const detail = document.querySelector("#stage-detail");
const fill = document.querySelector(".rail-fill");
const dots = [...document.querySelectorAll(".rail-dot")];

function activateStage(button, moveFocus = false) {
  const key = button.dataset.stage;
  const index = buttons.indexOf(button);
  const content = stageDetails[key];
  if (!content || !detail) return;

  buttons.forEach((item, i) => {
    const selected = item === button;
    item.classList.toggle("is-active", selected);
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
    dots[i]?.classList.toggle("is-active", i <= index);
  });

  detail.setAttribute("aria-labelledby", button.id);
  detail.querySelector(".stage-kicker").textContent = content.kicker;
  detail.querySelector("h3").textContent = content.title;
  detail.querySelector("p:not(.stage-kicker)").textContent = content.body;
  detail.querySelector(".stage-state").textContent = content.state;
  if (fill) fill.style.width = `${(index / (buttons.length - 1)) * 100}%`;
  if (moveFocus) button.focus();
}

buttons.forEach((button, index) => {
  button.addEventListener("click", () => activateStage(button));
  button.addEventListener("keydown", event => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = buttons[(index + delta + buttons.length) % buttons.length];
    activateStage(next, true);
  });
});

if (buttons.length) activateStage(buttons[0]);
