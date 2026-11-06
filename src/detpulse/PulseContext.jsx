import { createContext, useContext, useEffect, useMemo, useReducer } from "react"
import { NODES, RULES, canMerge } from "./model"

const PulseContext = createContext(null)

const INITIAL = {
  view: "overview",
  policyOpen: false,
  policy: { schema: "manual", lookup: "backtest", soar: "dual" },
  nodeId: "",
  stageId: "",
  remediationTier: "all",
  patched: {},
  drawer: null,
}

function reducer(state, action) {
  switch (action.type) {
    case "view":
      return {
        ...state,
        view: action.view,
        policyOpen: false,
        remediationTier: action.tier || (action.view === "remediation" ? "all" : state.remediationTier),
      }
    case "remediation-tier":
      return { ...state, remediationTier: action.tier }
    case "policy-toggle":
      return { ...state, policyOpen: !state.policyOpen }
    case "policy-close":
      return { ...state, policyOpen: false }
    case "policy":
      return { ...state, policy: { ...state.policy, [action.key]: action.value } }
    case "node":
      return { ...state, nodeId: state.nodeId === action.id ? "" : action.id, stageId: "" }
    case "stage":
      return { ...state, stageId: state.stageId === action.id ? "" : action.id, nodeId: "" }
    case "clear-node":
      return { ...state, nodeId: "", stageId: "" }
    case "open": {
      if (state.drawer?.mode !== "author" && state.drawer?.ruleId === action.id && !state.patched[action.id]) return state
      const rule = RULES.find((item) => item.id === action.id)
      if (!rule?.degraded && !state.patched[action.id]) return state
      return {
        ...state,
        policyOpen: false,
        drawer: {
          mode: "repair",
          ruleId: action.id,
          hunkBApproved: false,
          justification: "",
          coachOpen: false,
          constraintSaved: false,
          resynth: false,
          pendingCode: "",
          hunkBCode: rule.hunkB,
          replay: state.patched[action.id] ? "done" : "idle",
          copied: false,
        },
      }
    }
    case "author":
      return {
        ...state,
        policyOpen: false,
        drawer: {
          mode: "author",
          gapId: action.id,
          ruleId: action.id,
          hunkBApproved: false,
          justification: "",
          coachOpen: false,
          constraintSaved: false,
          resynth: false,
          pendingCode: "",
          hunkBCode: "",
          replay: "running",
          copied: false,
          deployed: false,
        },
      }
    case "deploy-author": {
      const gate = state.drawer?.mode === "author" && state.drawer.replay === "done" && state.drawer.hunkBApproved && state.drawer.justification
      if (!gate || state.drawer.deployed) return state
      return { ...state, drawer: { ...state.drawer, deployed: true } }
    }
    case "close":
      return { ...state, drawer: null }
    case "hunk":
      return { ...state, drawer: { ...state.drawer, hunkBApproved: !state.drawer.hunkBApproved } }
    case "justify":
      return { ...state, drawer: { ...state.drawer, justification: action.value } }
    case "coach-toggle":
      return { ...state, drawer: { ...state.drawer, coachOpen: !state.drawer.coachOpen } }
    case "coach-pick":
      return {
        ...state,
        drawer: { ...state.drawer, resynth: true, pendingCode: action.code, coachOpen: true },
      }
    case "resynth-done":
      if (!state.drawer?.resynth) return state
      return {
        ...state,
        drawer: {
          ...state.drawer,
          resynth: false,
          hunkBCode: state.drawer.pendingCode,
          constraintSaved: true,
        },
      }
    case "replay-start":
      if (!state.drawer || state.drawer.replay === "running") return state
      return { ...state, drawer: { ...state.drawer, replay: "running" } }
    case "replay-done":
      if (!state.drawer || state.drawer.replay !== "running") return state
      return { ...state, drawer: { ...state.drawer, replay: "done" } }
    case "copied":
      return { ...state, drawer: { ...state.drawer, copied: action.value } }
    case "merge": {
      if (!state.drawer || state.patched[state.drawer.ruleId] || !canMerge(state.drawer)) return state
      return {
        ...state,
        patched: { ...state.patched, [state.drawer.ruleId]: true },
      }
    }
    default:
      return state
  }
}

export function PulseProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL)
  const drawer = state.drawer

  useEffect(() => {
    if (!drawer?.resynth) return undefined
    const timer = window.setTimeout(() => dispatch({ type: "resynth-done" }), 1000)
    return () => window.clearTimeout(timer)
  }, [drawer?.resynth, drawer?.pendingCode, drawer?.ruleId])

  useEffect(() => {
    if (drawer?.replay !== "running") return undefined
    const timer = window.setTimeout(() => dispatch({ type: "replay-done" }), 1200)
    return () => window.clearTimeout(timer)
  }, [drawer?.replay, drawer?.ruleId])

  useEffect(() => {
    if (!drawer?.copied) return undefined
    const timer = window.setTimeout(() => dispatch({ type: "copied", value: false }), 1600)
    return () => window.clearTimeout(timer)
  }, [drawer?.copied, drawer?.ruleId])

  useEffect(() => {
    function onKey(event) {
      if (event.key !== "Escape") return
      if (state.drawer) dispatch({ type: "close" })
      else if (state.policyOpen) dispatch({ type: "policy-close" })
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [state.drawer, state.policyOpen])

  const derived = useMemo(() => {
    const patchedCount = Object.keys(state.patched).length
    const degradedAll = RULES.filter((rule) => rule.degraded).length
    const degradedLeft = RULES.filter((rule) => rule.degraded && !state.patched[rule.id])
    const schemaBreaks = degradedLeft.filter((rule) => rule.schemaBreak).length
    const gaps = degradedLeft.filter((rule) => rule.gap).map((rule) => rule.technique)
    const drop = degradedAll ? Math.round(((11.6 * degradedLeft.length) / degradedAll) * 10) / 10 : 0
    const drs = Math.round((78.4 + (11.6 - drop)) * 10) / 10
    return {
      patchedCount,
      degradedLeft,
      schemaBreaks,
      gaps,
      drs,
      drop,
      pending: degradedLeft.length,
      degradedHops: NODES.filter((node) => node.tone !== "healthy" && degradedLeft.some((rule) => rule.nodes.includes(node.id))).length,
      parserDrift: RULES.filter((rule) => rule.parserDrift && !state.patched[rule.id]).length,
      brokenWebhooks: RULES.filter((rule) => rule.webhook && !state.patched[rule.id]).length,
      drsSeries: patchedCount ? [92, 90, 88, 84, 80, 78.4, drs] : [92, 90, 88, 86, 84, 81, 78.4],
    }
  }, [state.patched])

  const value = useMemo(() => ({ ...state, ...derived, dispatch }), [state, derived])
  return <PulseContext.Provider value={value}>{children}</PulseContext.Provider>
}

export function usePulse() {
  return useContext(PulseContext)
}
