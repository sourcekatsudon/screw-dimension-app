// ネジタイプと図面ファイルの対応
const diagramMap = {
  'hex_socket_cap': 'hex_socket_cap.svg',
  'hex_socket_low_head': 'hex_socket_low_head.svg',
  'hex_socket_countersunk': 'countersunk_head.svg',
  'hex_socket_small_diameter': 'hex_socket_cap.svg',
  'hex_socket_with_washers': 'hex_socket_cap.svg',
  'hex_socket_button': 'hex_socket_cap.svg',
  'hex_socket_flange': 'hex_socket_cap.svg',
  'hex_head': 'hex_head.svg',
  'hex_upset': 'hex_head.svg',
  'hex_with_spring_washer': 'hex_head.svg',
  'pan_head': 'pan_head.svg',
  'countersunk_head': 'countersunk_head.svg',
  'oval_countersunk': 'countersunk_head.svg',
  'truss_head': 'truss_head.svg',
  'binding_head': 'pan_head.svg',
  'cup_head': 'pan_head.svg',
  'upset_head': 'pan_head.svg',
  'hex_nut': 'hex_nut.svg',
  'hex_thin_nut': 'hex_nut.svg',
  'flat_washer': 'flat_washer.svg',
  'spring_washer': 'flat_washer.svg'
};

// 図面表示用の関数
function showDiagram(typeKey) {
  const diagramFile = diagramMap[typeKey];
  if (diagramFile) {
    return `/static/diagrams/${diagramFile}`;
  }
  return null;
}

// ツールチップ用の図面表示
function createDiagramTooltip(typeKey, element) {
  const diagramPath = showDiagram(typeKey);
  if (!diagramPath) return;
  
  const tooltip = document.createElement('div');
  tooltip.className = 'diagram-tooltip';
  tooltip.innerHTML = `<img src="${diagramPath}" alt="寸法図" width="120" height="80">`;
  
  element.addEventListener('mouseenter', (e) => {
    document.body.appendChild(tooltip);
    tooltip.style.left = e.pageX + 10 + 'px';
    tooltip.style.top = e.pageY + 10 + 'px';
    tooltip.style.display = 'block';
  });
  
  element.addEventListener('mouseleave', () => {
    if (tooltip.parentNode) {
      tooltip.parentNode.removeChild(tooltip);
    }
  });
  
  element.addEventListener('mousemove', (e) => {
    tooltip.style.left = e.pageX + 10 + 'px';
    tooltip.style.top = e.pageY + 10 + 'px';
  });
}