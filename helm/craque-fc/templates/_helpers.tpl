{{/*
Expand the name of the chart.
*/}}
{{- define "craque-fc.name" -}}
{{- default .Chart.Name .Values.global.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "craque-fc.fullname" -}}
{{- if .Values.global.nameOverride }}
{{- .Values.global.nameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "craque-fc.labels" -}}
helm.sh/chart: {{ include "craque-fc.name" . }}-{{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/part-of: {{ include "craque-fc.name" . }}
{{- end }}

{{/*
API selector labels
*/}}
{{- define "craque-fc.api.selectorLabels" -}}
app.kubernetes.io/name: {{ include "craque-fc.fullname" . }}-api
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: api
{{- end }}

{{/*
Web selector labels
*/}}
{{- define "craque-fc.web.selectorLabels" -}}
app.kubernetes.io/name: {{ include "craque-fc.fullname" . }}-web
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: web
{{- end }}

{{/*
Worker selector labels
*/}}
{{- define "craque-fc.worker.selectorLabels" -}}
app.kubernetes.io/name: {{ include "craque-fc.fullname" . }}-worker
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: worker
{{- end }}

{{/*
Dragonfly selector labels
*/}}
{{- define "craque-fc.dragonfly.selectorLabels" -}}
app.kubernetes.io/name: {{ include "craque-fc.fullname" . }}-dragonfly
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: dragonfly
{{- end }}

{{/*
Resolve image with optional global registry
*/}}
{{- define "craque-fc.image" -}}
{{- $registry := .global.imageRegistry -}}
{{- if $registry -}}
{{- printf "%s/%s:%s" $registry .image.repository .image.tag -}}
{{- else -}}
{{- printf "%s:%s" .image.repository .image.tag -}}
{{- end -}}
{{- end }}
