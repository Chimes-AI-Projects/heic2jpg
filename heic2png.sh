#!/usr/bin/env bash
# heic2png — 批次把 .HEIC/.HEIF 轉成 .png（使用 macOS 內建 sips，免安裝任何套件）
set -euo pipefail

usage() {
  cat <<'EOF'
用法: heic2png.sh [選項] <檔案或資料夾>...

選項:
  -o DIR   輸出資料夾（預設：與原檔同一資料夾）
  -r       遞迴處理子資料夾
  -j N     平行處理數量（預設：CPU 核心數）
  -f       覆蓋已存在的 .png（預設：略過）
  -d       轉檔成功後刪除原始 HEIC（移到垃圾桶）
  -h       顯示說明

範例:
  heic2png.sh ~/Pictures/iphone            # 轉換資料夾內所有 HEIC
  heic2png.sh -r -o ~/Desktop/png ~/Photos  # 遞迴，輸出到指定資料夾
  heic2png.sh IMG_0001.HEIC IMG_0002.heic   # 指定檔案
EOF
}

OUT_DIR=""
RECURSIVE=0
JOBS="$(sysctl -n hw.ncpu 2>/dev/null || echo 4)"
FORCE=0
DELETE_SRC=0

while getopts ":o:rj:fdh" opt; do
  case "$opt" in
    o) OUT_DIR="$OPTARG" ;;
    r) RECURSIVE=1 ;;
    j) JOBS="$OPTARG" ;;
    f) FORCE=1 ;;
    d) DELETE_SRC=1 ;;
    h) usage; exit 0 ;;
    :) echo "錯誤：-$OPTARG 需要參數" >&2; exit 2 ;;
    *) echo "錯誤：未知選項 -$OPTARG" >&2; usage >&2; exit 2 ;;
  esac
done
shift $((OPTIND - 1))

[[ $# -eq 0 ]] && { usage >&2; exit 2; }
[[ "$JOBS" =~ ^[1-9][0-9]*$ ]] || { echo "錯誤：-j 必須是正整數" >&2; exit 2; }
command -v sips >/dev/null || { echo "錯誤：找不到 sips（此工具僅支援 macOS）" >&2; exit 1; }
[[ -n "$OUT_DIR" ]] && mkdir -p "$OUT_DIR"

# 收集輸入檔（NUL 分隔，安全處理含空白/中文的檔名）
LIST="$(mktemp -t heic2png)"
trap 'rm -f "$LIST"' EXIT

depth=(-maxdepth 1)
(( RECURSIVE )) && depth=()
# 每筆記錄 = 根目錄\0檔案\0；有 -o 時依根目錄保留子資料夾結構，避免同名檔互相覆蓋
for p in "$@"; do
  if [[ -d "$p" ]]; then
    find "$p" ${depth[@]+"${depth[@]}"} -type f \( -iname '*.heic' -o -iname '*.heif' \) -print0 |
      while IFS= read -r -d '' f; do printf '%s\0%s\0' "${p%/}" "$f"; done >>"$LIST"
  elif [[ -f "$p" ]]; then
    printf '%s\0%s\0' "$(dirname "$p")" "$p" >>"$LIST"
  else
    echo "警告：找不到 $p，已略過" >&2
  fi
done

total=$(( $(tr -cd '\0' <"$LIST" | wc -c) / 2 ))
if [[ "$total" -eq 0 ]]; then
  echo "沒有找到任何 HEIC/HEIF 檔案。"
  exit 0
fi
echo "找到 $total 個檔案，以 $JOBS 個平行工作轉換中…"

convert_one() {
  local root="$1" src="$2" rel dest
  if [[ -n "$OUT_DIR" ]]; then
    rel="${src#"$root"/}"
    dest="$OUT_DIR/${rel%.*}.png"
    mkdir -p "$(dirname "$dest")"
  else
    dest="${src%.*}.png"
  fi

  if [[ -e "$dest" && "$FORCE" -eq 0 ]]; then
    echo "SKIP  $src（$dest 已存在）"
    return 0
  fi
  if sips -s format png "$src" --out "$dest" >/dev/null 2>&1; then
    echo "OK    $src -> $dest"
    if [[ "$DELETE_SRC" -eq 1 ]]; then
      /usr/bin/trash "$src" >/dev/null 2>&1 \
        || echo "WARN  無法將 $src 移到垃圾桶" >&2
    fi
  else
    echo "FAIL  $src" >&2
    return 1
  fi
}
export -f convert_one
export OUT_DIR FORCE DELETE_SRC

set +e
xargs -0 -n 2 -P "$JOBS" bash -c 'convert_one "$1" "$2"' _ <"$LIST"
status=$?
set -e

if [[ $status -ne 0 ]]; then
  echo "完成，但有檔案轉換失敗（見上方 FAIL）。" >&2
  exit 1
fi
echo "全部完成。"
