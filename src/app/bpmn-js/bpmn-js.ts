// import _Modeler from 'bpmn-js/lib/Modeler.js';
import * as _Modeler from "bpmn-js/dist/bpmn-modeler.production.min.js";
import * as _PropertiesPanelModule from 'bpmn-js-properties-panel';
import * as _BpmnPropertiesProvider from 'bpmn-js-properties-panel/lib/provider/camunda';
import * as _EntryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import _PaletteProvider from 'bpmn-js/lib/features/palette/PaletteProvider';
import _Renderer from './draw/BpmnRenderer';

export const InjectionNames = {
  eventBus: 'eventBus',
  bpmnFactory: 'bpmnFactory',
  bpmnRenderer: 'bpmnRenderer',
  renderer: 'renderer',
  elementRegistry: 'elementRegistry',
  translate: 'translate',
  propertiesProvider: 'propertiesProvider',
  bpmnPropertiesProvider: 'bpmnPropertiesProvider',
  paletteProvider: 'paletteProvider',
  originalPaletteProvider: 'originalPaletteProvider',
};

export const Modeler = _Modeler;
export const PropertiesPanelModule = _PropertiesPanelModule;
export const EntryFactory = _EntryFactory;
export const OriginalRenderer = _Renderer;
export const OriginalPaletteProvider = _PaletteProvider;
export const OriginalPropertiesProvider = _BpmnPropertiesProvider;


export interface IPaletteProvider {
  getPaletteEntries(): any;
}

export interface IPalette {
  registerProvider(provider: IPaletteProvider): any;
}

export interface IPropertiesProvider {
  getTabs(elemnt): any;
}
