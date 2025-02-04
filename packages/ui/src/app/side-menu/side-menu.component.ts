// src/app/side-menu/side-menu.component.ts
import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { NodeTypes } from '../chart/chart.consts';
import { ChartWrapper } from '../chart/chart.wrapper';
import { Color, IdType, Node } from 'vis';
import { VisiNode } from '../types.nodejs';

const menuTypes = [NodeTypes.toDoNode, NodeTypes.groupNode, NodeTypes.failedSync]

export interface NodeMenuInfo {
  isDone?: boolean;
  isFailed?: boolean;
  text: string;
}

interface MenuItem {
  nodeId: IdType;
  info: NodeMenuInfo
}

interface MenuGroup {
  type: NodeTypes;
  nodes: MenuItem[];
}

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent implements OnInit {
  @Input() chartWrapper: ChartWrapper;

  isOpen = false;
  menuGroups: MenuGroup[] = [];
  selectedGroupType: NodeTypes | null = null;

  @HostBinding('class.open') get open() { return this.isOpen; }
  @HostBinding('class.closed') get closed() { return !this.isOpen; }

  selectedNodeId: string | null = null;

  ngOnInit() {
    if (this.chartWrapper) {
      // Set up click event handler to update menu items
      this.chartWrapper.setClickEvent(() => {
        this.updateMenuItems();
      });

      // Initial population of menu items
      this.updateMenuItems();
    }
  }

  private updateMenuItems() {
    this.menuGroups = [];

    menuTypes.forEach(type => {
      // Get nodes filtered by type using chartWrapper
      const nodesOfType = this.chartWrapper.getAllNodes((node: VisiNode) => node.d.type === type);

      const menuNodes: MenuItem[] = nodesOfType.map((node: VisiNode) => ({
        nodeId: node.id,
        info: {
          isDone: node.d.isMarkedDone || false,
          text: node.label || ''
        }
      }));

      if (menuNodes.length > 0) {
        this.menuGroups.push({
          type: type,
          nodes: menuNodes
        });
      }
    });

  }

  toggleItems(nodeId: string) {
    if (this.selectedNodeId === nodeId) {
      this.selectedNodeId = null;
    } else {
      this.selectedNodeId = nodeId;
      // Focus on the selected node in the chart
      if (this.chartWrapper) {
        this.chartWrapper.setSelection({ nodes: [nodeId], edges: [] });
        this.chartWrapper.fitToNodes_specific([nodeId]);
      }
    }
  }

  toggleGroup(type: NodeTypes) {
    if (this.selectedGroupType === type) {
      this.selectedGroupType = null;
    } else {
      this.selectedGroupType = type;
    }
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
    this.updateMenuItems();
  }

  toggleDone(menuItem: MenuItem, type: NodeTypes) {
    if(type !== NodeTypes.toDoNode) return

    const group = this.menuGroups.find(g => g.nodes.some(n => n.nodeId === menuItem.nodeId));
    if (!group) { console.log('could not find group'); return; }
    const node = group.nodes.find(n => n.nodeId === menuItem.nodeId);
    if (!node) { console.log('could not find ndoe'); return; }

    const isMarked = !node.info.isDone;
    node.info.isDone = isMarked;
    this.chartWrapper.updateNodes({}, {
      filterFunc: (node) => node.id === menuItem.nodeId,
      processFunc: (node: VisiNode) => {
        node.d.isMarkedDone = isMarked;
        if(isMarked) node.color = '#2e8151'
        else node.color = '#ffffff'
        return node;
      }
    });
    this.menuGroups = [...this.menuGroups];
  }
}
