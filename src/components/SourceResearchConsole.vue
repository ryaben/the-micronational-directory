<script setup>
import { onBeforeUnmount, ref } from 'vue'
import { auth } from '../firebase/auth.js'
import HelpTooltip from './HelpTooltip.vue'
import { translate } from '../i18n.js'

const sources = [
  { id: 'microwiki', label: 'MicroWiki' },
  { id: 'micronaciones_fandom', label: 'Micronaciones Fandom' },
  { id: 'micraswiki', label: 'MicrasWiki' },
  { id: 'google_mymaps', label: 'Google My Maps' }
]
const source = ref('microwiki')
const offset = ref(0)
const maxEntries = ref(3)
const candidateNames = ref('')
const running = ref(false)
const busy = ref(false)
const run = ref(null)
const output = ref(translate('sourceResearch.ready') + '\n')
const error = ref('')
let pollTimer
const tooltips = {
  source: ['source', 'sourceHelp'],
  offset: ['offset', 'offsetHelp'],
  maxEntries: ['maxEntries', 'maxEntriesHelp'],
  candidateNames: ['candidateNames', 'candidateNamesHelp']
}
const activeTooltip = ref(null)
const tooltipPosition = ref({ x: 0, y: 0 })

function openTooltip(key, event) {
  const [titleKey, textKey] = tooltips[key]
  activeTooltip.value = {
    title: translate(`sourceResearch.${titleKey}`),
    text: translate(`sourceResearch.${textKey}`)
  }
  tooltipPosition.value = {
    x: Math.max(12, Math.min(event.clientX + 12, window.innerWidth - 352)),
    y: Math.max(12, Math.min(event.clientY + 12, window.innerHeight * 0.3))
  }
}

async function apiRequest(method, url, body) {
  const token = await auth.currentUser?.getIdToken()
  if (!token) throw new Error(translate('sourceResearch.signInRequired'))
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || translate('sourceResearch.requestFailed', { status: response.status }))
  return result
}

async function start() {
  if (busy.value) return
  busy.value = true
  running.value = false
  run.value = null
  error.value = ''
  output.value = translate('sourceResearch.dispatching', { source: source.value, offset: offset.value, max: maxEntries.value }) + '\n'
  try {
    const result = await apiRequest('POST', '/api/source-research', {
      source: source.value,
      offset: Number(offset.value),
      maxEntries: Number(maxEntries.value),
      candidateNames: candidateNames.value
    })
    if (!result.runId) {
      output.value += `${result.message}\n${result.actionsUrl}\n`
      return
    }
    run.value = result
    running.value = true
    output.value += `${translate('sourceResearch.workflowRun', { id: result.runId, status: result.status })}\n${result.runUrl}\n${translate('sourceResearch.waitingForActions')}\n`
    await poll()
  } catch (cause) {
    error.value = cause.message
    output.value += `${translate('sourceResearch.errorPrefix')}: ${cause.message}\n`
  } finally {
    busy.value = false
  }
}

async function poll() {
  if (!run.value?.runId) return
  try {
    const result = await apiRequest(
      'GET',
      `/api/source-research?runId=${encodeURIComponent(run.value.runId)}`
    )
    run.value = result
    if (result.logs) output.value = result.logs
    else {
      const steps = (result.jobs || []).flatMap((job) =>
        job.steps.map((step) => `${step.name}: ${step.conclusion || step.status}`)
      )
      output.value = `${translate('sourceResearch.workflowRunNumber', { id: result.runId })}\n${translate('sourceResearch.statusLabel')}: ${result.status}${
        result.conclusion ? ` (${result.conclusion})` : ''
      }\n${result.runUrl}\n${
        steps.length ? `${steps.join('\n')}\n` : ''
      }${translate('sourceResearch.actionsRunning')}\n`
    }
    if (result.status === 'completed') {
      running.value = false
      if (!result.logs)
        output.value +=
          `\n${translate('sourceResearch.logsUnavailable')}\n`
      return
    }
    pollTimer = setTimeout(poll, 5000)
  } catch (cause) {
    error.value = cause.message
    output.value += `\n${translate('sourceResearch.refreshFailed')}: ${cause.message}\n`
    pollTimer = setTimeout(poll, 10000)
  }
}

onBeforeUnmount(() => clearTimeout(pollTimer))
</script>

<template>
  <section class="source-research-console">
    <Transition name="fade">
      <HelpTooltip
        v-if="activeTooltip"
        :title="activeTooltip.title"
        :help-text="activeTooltip.text"
        :position="tooltipPosition"
        @closed-tooltip="activeTooltip = null"
      />
    </Transition>
    <header class="research-notes">
      <div class="research-notes-copy">
        <p>{{ $t('sourceResearch.description') }}</p>
      </div>
      <a v-if="run?.runUrl" :href="run.runUrl" target="_blank" rel="noopener noreferrer"
        >{{ $t('sourceResearch.openActions') }} ↗</a
      >
    </header>

    <div class="workflow-layout">
      <form class="research-controls" @submit.prevent="start">
        <div class="required-parameters">
          <label
            >{{ $t('sourceResearch.source') }}
            <button
              type="button"
              class="tooltip-activator"
              :aria-label="$t('sourceResearch.helpSource')"
              @click="openTooltip('source', $event)"
            >
              <img src="/images/info.png" alt="" />
            </button>
            <select v-model="source" :disabled="running">
              <option v-for="item in sources" :key="item.id" :value="item.id">
                {{ item.label }}
              </option>
            </select>
          </label>
          <label
            >{{ $t('sourceResearch.offset') }}
            <button
              type="button"
              class="tooltip-activator"
              :aria-label="$t('sourceResearch.helpOffset')"
              @click="openTooltip('offset', $event)"
            >
              <img src="/images/info.png" alt="" />
            </button>
            <input v-model.number="offset" type="number" min="0" step="1" :disabled="running" />
          </label>
          <label
            >{{ $t('sourceResearch.maxEntries') }}
            <button
              type="button"
              class="tooltip-activator"
              :aria-label="$t('sourceResearch.helpMaxEntries')"
              @click="openTooltip('maxEntries', $event)"
            >
              <img src="/images/info.png" alt="" />
            </button>
            <input v-model.number="maxEntries" type="number" min="1" step="1" :disabled="running" />
          </label>
        </div>
        <label class="candidate-names"
          >{{ $t('sourceResearch.candidateNames') }}
          <button
            type="button"
            class="tooltip-activator"
            :aria-label="$t('sourceResearch.helpCandidateNames')"
            @click="openTooltip('candidateNames', $event)"
          >
            <img src="/images/info.png" alt="" />
          </button>
          <textarea
            v-model="candidateNames"
            rows="5"
            maxlength="5000"
            :placeholder="$t('sourceResearch.candidateNamesPlaceholder')"
            :disabled="running"
          />
        </label>
        <button
          type="submit"
          class="login-button short start-research-button"
          :disabled="busy || running"
        >
          {{ busy ? $t('sourceResearch.starting') : running ? $t('sourceResearch.running') : $t('sourceResearch.start') }}
        </button>
      </form>

      <div class="terminal-heading">
        <strong>{{ $t('sourceResearch.terminal') }}</strong
        ><span v-if="running" class="terminal-running">{{ $t('sourceResearch.runningCaps') }}</span
        ><span v-else-if="run?.status === 'completed'">{{ run.conclusion || $t('sourceResearch.completedCaps') }}</span>
        <pre class="terminal-output" aria-live="polite">{{ output }}</pre>
        <p v-if="error" class="console-error" role="alert">{{ error }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.site-section {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.source-research-console {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 18px;
  padding: 16px;
  color: var(--color-text);
}

.workflow-layout {
  display: grid;
  grid-template-columns: minmax(260px, 0.8fr) minmax(0, 1.2fr);
  align-items: stretch;
  gap: 20px;
}

.research-notes {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  min-height: 54px;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  background: var(--color-surface-raised);
}

.research-notes-copy {
  width: 50%;
  min-width: 0;
  text-align: left;
}

.research-notes p {
  margin: 0;
  color: var(--color-muted);
  font-size: 14px;
  line-height: 1.5;
}

.research-controls {
  display: grid;
  align-content: start;
  gap: 12px;
}

.research-controls label {
  display: grid;
  grid-template-columns: auto 20px 1fr;
  gap: 6px;
  color: var(--color-muted);
  font-size: 12px;
}

.research-controls label > select,
.research-controls label > input,
.research-controls label > textarea {
  grid-column: 1 / -1;
}

.tooltip-activator {
  display: inline-grid;
  place-items: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.tooltip-activator img {
  display: block;
  width: 16px;
  height: 16px;
}

.research-controls input,
.research-controls select,
.research-controls textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 9px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-heading);
  background: var(--color-surface);
  font: inherit;
}

.candidate-names {
  align-self: start;
}

.candidate-names textarea {
  min-height: 150px;
  resize: vertical;
  vertical-align: top;
}

.required-parameters {
  display: grid;
  align-content: start;
  gap: 12px;
}

.start-research-button {
  justify-self: start;
}

.terminal-heading {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
  margin-left: 2px;
  padding-left: 20px;
  border-left: 1px solid var(--color-border);
  color: var(--color-heading);
}

.terminal-heading span {
  color: var(--color-muted);
  font-size: 11px;
}

.terminal-heading .terminal-running {
  color: #e6b450;
}

.terminal-output {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 55vh;
  max-height: 70vh;
  overflow: auto;
  margin: 5px 0;
  padding: 16px;
  border: 1px solid #303b4e;
  border-radius: var(--radius-lg);
  color: #d8e0ec;
  background: #111822;
  font:
    12px/1.55 ui-monospace,
    SFMono-Regular,
    Consolas,
    monospace;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.console-error {
  margin: 0;
  color: var(--color-danger, #e66);
}

@media (max-width: 700px) {
  .source-research-console {
    padding: 12px;
  }

  .research-notes {
    align-items: start;
    flex-direction: column;
  }

  .research-notes-copy {
    width: 100%;
  }

  .workflow-layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 18px;
  }

  .research-controls {
    grid-template-columns: minmax(0, 1fr);
  }

  .required-parameters {
    grid-column: 1;
  }

  .candidate-names {
    grid-column: 1;
  }

  .terminal-heading {
    margin-top: 0;
    margin-left: 0;
    padding-top: 16px;
    padding-left: 0;
    border-top: 1px solid var(--color-border);
    border-left: 0;
  }
}
</style>
