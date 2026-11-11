import { useEffect, useRef, useState } from 'react';
import ForceGraph3D, { type ForceGraph3DInstance } from '3d-force-graph';
import {
  CanvasTexture,
  LineBasicMaterial,
  Sprite,
  SpriteMaterial,
  Vector3,
  type PerspectiveCamera,
} from 'three';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Minus, Plus, Scan, Maximize2, Minimize2, LocateFixed } from 'lucide-react';
import { LoadingStage } from '@preview/ui/loading';
import { useShowcaseText } from './showcase-locale';
import { graphEmphasis, graphNodeColor, graphRelationColor, graphVisibility } from './graph-presentation';
import { graphDemandRendering, sphereGraphData, type SphereNode, type SphereLink } from './graph-sphere';
import { graphTopology, type GraphViewProps } from './graph-view';

export default function RequirementGraphSphere(props: GraphViewProps) {
  const text = useShowcaseText();
  const host = useRef<HTMLDivElement>(null);
  const labelsHost = useRef<HTMLDivElement>(null);
  const current = useRef({ ...props, text });
  const update = useRef<() => void>(() => {});
  const action = useRef<(kind: string) => void>(() => {});
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    current.current = { ...props, text };
    update.current();
  }, [props, text]);
  useEffect(() => {
    const element = host.current;
    const labels = labelsHost.current;
    if (!element || !labels) return;
    let graph: ForceGraph3DInstance<SphereNode, SphereLink>;
    try {
      graph = new ForceGraph3D(element, {
        controlType: 'orbit',
        rendererConfig: { antialias: true, alpha: true, powerPreference: 'low-power' },
      }) as unknown as ForceGraph3DInstance<SphereNode, SphereLink>;
    } catch {
      setError(current.current.text('当前设备无法启用 3D，请切换到 2D 继续查看。'));
      return;
    }
    graph.pauseAnimation();
    const memory = current.current.memory.current;
    const controls = graph.controls() as OrbitControls;
    controls.enableDamping = false;
    controls.autoRotate = false;
    controls.enablePan = false;
    controls.rotateSpeed = 0.65;
    controls.minDistance = 280;
    controls.maxDistance = 2200;
    const renderer = graph.renderer();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    const circle = document.createElement('canvas');
    circle.width = circle.height = 32;
    const painter = circle.getContext('2d')!;
    painter.fillStyle = '#ffffff';
    painter.beginPath();
    painter.arc(16, 16, 14, 0, Math.PI * 2);
    painter.fill();
    const texture = new CanvasTexture(circle);
    const sprites = new Map<string, Sprite>();
    const lines = new Map<string, LineBasicMaterial>();
    const labelElements = new Map<string, HTMLSpanElement>();
    let drawing = sphereGraphData([], []);
    let topology = '';
    let lastSelected: string | null = null;
    let lastArrows = '';
    let hovered: string | null = null;
    let disposed = false;
    let initialized = false;
    let initializeFrame = 0;
    let visible = graphVisibility([], [], [], []);
    let emphasizing = graphEmphasis([], [], null, null, visible);
    let currentLabels: SphereNode[] = [];
    const vector = new Vector3();
    const direction = new Vector3();
    const placeLabels = () => {
      const camera = graph.camera();
      direction.copy(camera.position).normalize();
      for (const node of currentLabels) {
        const label = labelElements.get(node.id);
        if (!label) continue;
        const point = graph.graph2ScreenCoords(node.x, node.y, node.z);
        const front = vector.set(node.x, node.y, node.z).dot(direction) > 0 || drawing.nodes.length === 1;
        label.hidden =
          !front ||
          point.x < 12 ||
          point.x > element.clientWidth - 12 ||
          point.y < 12 ||
          point.y > element.clientHeight - 24;
        label.style.transform = `translate(${Math.round(point.x)}px,${Math.round(point.y + 11)}px) translateX(-50%)`;
      }
    };
    const demand = graphDemandRendering(
      () => graph.resumeAnimation(),
      () => graph.pauseAnimation(),
    );
    const wake = () => {
      if (!disposed && !document.hidden) demand.wake(placeLabels);
    };
    const remember = () => {
      memory.camera = { ...graph.cameraPosition() };
      memory.target = { x: controls.target.x, y: controls.target.y, z: controls.target.z };
      wake();
    };
    const focus = () => {
      const node = drawing.nodes.find((item) => item.id === current.current.selected);
      if (!node) return;
      const distance = Math.max(600, graph.camera().position.length());
      const position = new Vector3(node.x, node.y, node.z);
      if (position.length() === 0) position.set(0, 0, 1);
      position.normalize().multiplyScalar(distance);
      graph.cameraPosition({ x: position.x, y: position.y, z: position.z }, { x: 0, y: 0, z: 0 });
      wake();
    };
    const refresh = () => {
      if (disposed) return;
      const data = current.current;
      const next = graphTopology(data.nodes, data.edges);
      if (topology !== next) {
        topology = next;
        drawing = sphereGraphData(data.nodes, data.edges);
        initialized = false;
        setReady(false);
        graph.graphData(drawing);
      }
      visible = graphVisibility(data.nodes, data.edges, data.hiddenTypes, data.hiddenRelations);
      emphasizing = graphEmphasis(data.nodes, data.edges, data.selected, data.focus, visible);
      for (const node of data.nodes) {
        const sprite = sprites.get(node.id);
        if (!sprite) continue;
        sprite.visible = visible.nodeIds.has(node.id);
        sprite.material.opacity = emphasizing.active && !emphasizing.nodeIds.has(node.id) ? 0.14 : 1;
        sprite.material.color.set(graphNodeColor(node.type));
        const size = node.id === data.selected || node.id === hovered ? 11 : 6.5;
        sprite.scale.set(size, size, 1);
      }
      for (const edge of data.edges) {
        const material = lines.get(edge.id);
        if (!material) continue;
        const important = emphasizing.edgeIds.has(edge.id);
        material.visible = visible.edgeIds.has(edge.id);
        material.opacity = emphasizing.active ? (important ? 0.8 : 0.025) : 0.13;
        material.color.set(important && emphasizing.active ? graphRelationColor(edge.relation) : '#8b95a6');
      }
      const wanted = new Set<string>([
        ...(data.selected ? [data.selected] : []),
        ...(hovered ? [hovered] : []),
        ...(emphasizing.active
          ? [...emphasizing.nodeIds].filter((id) => visible.nodeIds.has(id)).slice(0, 10)
          : []),
      ]);
      for (const [identifier, label] of labelElements)
        if (!wanted.has(identifier)) {
          label.remove();
          labelElements.delete(identifier);
        }
      for (const identifier of wanted) {
        if (!visible.nodeIds.has(identifier)) continue;
        let label = labelElements.get(identifier);
        if (!label) {
          label = document.createElement('span');
          label.className = 'requirement-graph-sphere-label';
          labels.append(label);
          labelElements.set(identifier, label);
        }
        label.textContent = data.text(data.nodes.find((node) => node.id === identifier)?.label ?? identifier);
        label.dataset.selected = String(identifier === data.selected);
      }
      currentLabels = drawing.nodes.filter((node) => labelElements.has(node.id));
      const arrowSignature = JSON.stringify([data.selected, data.hiddenTypes, data.hiddenRelations, topology]);
      if (arrowSignature !== lastArrows) {
        lastArrows = arrowSignature;
        const directionless = new Set(data.edges.filter((edge) => edge.relation === 'integrates_with' || edge.relation === 'similar_to').map((edge) => edge.id));
        graph.linkDirectionalArrowLength((link) =>
          data.selected && emphasizing.edgeIds.has(link.id) && visible.edgeIds.has(link.id) && !directionless.has(link.id) ? 4 : 0,
        );
      }
      if (initialized && data.selected !== lastSelected && data.selected) focus();
      lastSelected = data.selected;
      wake();
    };
    graph
      .backgroundColor('rgba(0,0,0,0)')
      .showNavInfo(false)
      .enableNodeDrag(false)
      .cooldownTicks(0)
      .warmupTicks(0)
      .nodeThreeObject((node) => {
        const material = new SpriteMaterial({
          map: texture,
          transparent: true,
          alphaTest: 0.05,
          depthWrite: false,
          color: graphNodeColor(current.current.nodes.find((item) => item.id === node.id)?.type ?? 'feature'),
        });
        const sprite = new Sprite(material);
        sprite.scale.set(6.5, 6.5, 1);
        sprites.set(node.id, sprite);
        return sprite;
      })
      .nodeLabel(() => '')
      .linkLabel((link) => {
        if (!visible.edgeIds.has(link.id)) return '';
        const edge = current.current.edges.find((item) => item.id === link.id);
        const content = document.createElement('span');
        content.textContent = edge
          ? `${current.current.text(edge.label)} · ${current.current.text(edge.reason)}`
          : '';
        return content;
      })
      .linkMaterial((link) => {
        const material = new LineBasicMaterial({
          color: '#8b95a6',
          opacity: 0.13,
          transparent: true,
          depthWrite: false,
        });
        lines.set(link.id, material);
        return material;
      })
      .linkWidth(0)
      .linkDirectionalParticles(0)
      .linkHoverPrecision(2)
      .onNodeClick((node) => {
        if (visible.nodeIds.has(node.id)) current.current.onSelect(node.id);
      })
      .onBackgroundClick(() => current.current.onSelect(null))
      .onNodeHover((node) => {
        const next = node && visible.nodeIds.has(node.id) ? node.id : null;
        if (next === hovered) return;
        hovered = next;
        refresh();
      })
      .onEngineStop(() => {
        if (disposed) return;
        if (initialized) return;
        if (initializeFrame) return;
        initializeFrame = requestAnimationFrame(() => {
          initializeFrame = 0;
          if (disposed) return;
          const saved = memory.topology === topology && memory.camera;
          if (saved) graph.cameraPosition(saved, memory.target);
          else graph.zoomToFit(0, 42);
          memory.topology = topology;
          initialized = true;
          if (current.current.selected) focus();
          setReady(true);
          refresh();
        });
      });
    const resize = new ResizeObserver(() => {
      const bounds = element.parentElement;
      if (!bounds || bounds.clientWidth < 1 || bounds.clientHeight < 1) return;
      graph.width(bounds.clientWidth).height(bounds.clientHeight);
      if (initialized && current.current.selected) focus();
      wake();
    });
    resize.observe(element.parentElement ?? element);
    if (element.parentElement)
      graph.width(element.parentElement.clientWidth).height(element.parentElement.clientHeight);
    const theme = new MutationObserver(wake);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'style'],
    });
    const site = element.closest('.uiarc-showcase');
    if (site) theme.observe(site, { attributes: true, attributeFilter: ['data-theme', 'style'] });
    const visibility = () => {
      if (document.hidden) demand.stop();
      else wake();
    };
    const lost = (event: Event) => {
      event.preventDefault();
      demand.stop();
      setError(current.current.text('3D 画布已暂停，请切换到 2D 或重新打开 3D。'));
    };
    renderer.domElement.addEventListener('webglcontextlost', lost);
    for (const name of ['pointerdown', 'pointermove', 'pointerup', 'wheel', 'pointerleave'])
      element.addEventListener(name, wake, { passive: true });
    controls.addEventListener('change', remember);
    document.addEventListener('visibilitychange', visibility);
    update.current = refresh;
    action.current = (kind) => {
      if (!initialized) return;
      if (kind === 'fit') graph.zoomToFit(0, 42);
      else if (kind === 'locate') focus();
      else if (kind === '+' || kind === '-') {
        const position = graph
          .camera()
          .position.clone()
          .sub(controls.target)
          .multiplyScalar(kind === '+' ? 0.8 : 1.25);
        position.clampLength(controls.minDistance, controls.maxDistance).add(controls.target);
        graph.cameraPosition({ x: position.x, y: position.y, z: position.z }, controls.target);
      } else {
        const camera = graph.camera() as PerspectiveCamera;
        const axis =
          kind === 'ArrowUp' || kind === 'ArrowDown'
            ? new Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
            : new Vector3(0, 1, 0);
        const position = camera.position
          .clone()
          .applyAxisAngle(axis, kind === 'ArrowLeft' || kind === 'ArrowUp' ? 0.12 : -0.12);
        graph.cameraPosition({ x: position.x, y: position.y, z: position.z }, controls.target);
      }
      wake();
    };
    refresh();
    return () => {
      disposed = true;
      memory.camera = { ...graph.cameraPosition() };
      memory.target = { x: controls.target.x, y: controls.target.y, z: controls.target.z };
      demand.dispose();
      cancelAnimationFrame(initializeFrame);
      resize.disconnect();
      theme.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      controls.removeEventListener('change', remember);
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      for (const name of ['pointerdown', 'pointermove', 'pointerup', 'wheel', 'pointerleave'])
        element.removeEventListener(name, wake);
      update.current = () => {};
      action.current = () => {};
      graph._destructor();
      renderer.forceContextLoss();
      texture.dispose();
      for (const sprite of sprites.values()) sprite.material.dispose();
      for (const material of lines.values()) material.dispose();
      labels.replaceChildren();
    };
  }, []);

  return (
    <div className="requirement-graph-stage">
      <div className="requirement-graph-viewport">
        <div
          ref={host}
          className="requirement-graph-canvas"
          data-view="3d"
          role="img"
          tabIndex={0}
          aria-busy={!ready && !error}
          aria-label={text('球形需求图谱，拖拽旋转，滚轮缩放')}
          onKeyDown={(event) => {
            if (!['+', '=', '-', '0', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key))
              return;
            event.preventDefault();
            action.current(event.key === '=' ? '+' : event.key === '0' ? 'fit' : event.key);
          }}
        />
        <div ref={labelsHost} className="requirement-graph-sphere-labels" aria-hidden="true" />
        {!ready && !error && (
          <div className="requirement-graph-canvas-loading">
            <LoadingStage label={text('绘制关系图谱…')} />
          </div>
        )}
        {error && (
          <div className="requirement-graph-canvas-error" role="alert">
            {error}
          </div>
        )}
      </div>
      <div className="requirement-graph-tools" aria-label={text('图谱视图控制')}>
        <button
          type="button"
          title={text('缩小')}
          aria-label={text('缩小')}
          disabled={!ready}
          onClick={() => action.current('-')}
        >
          <Minus size={16} />
        </button>
        <button
          type="button"
          title={text('放大')}
          aria-label={text('放大')}
          disabled={!ready}
          onClick={() => action.current('+')}
        >
          <Plus size={16} />
        </button>
        <button
          type="button"
          title={text('适应画布')}
          aria-label={text('适应画布')}
          disabled={!ready}
          onClick={() => action.current('fit')}
        >
          <Scan size={16} />
        </button>
        {props.selected && (
          <button
            type="button"
            title={text('定位当前节点')}
            aria-label={text('定位当前节点')}
            disabled={!ready}
            onClick={() => action.current('locate')}
          >
            <LocateFixed size={16} />
          </button>
        )}
        <button
          type="button"
          title={text(props.expanded ? '退出全屏' : '全屏')}
          aria-label={text(props.expanded ? '退出全屏' : '全屏')}
          onClick={props.onExpand}
        >
          {props.expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
    </div>
  );
}
