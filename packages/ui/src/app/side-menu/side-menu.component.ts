// src/app/side-menu/side-menu.component.ts
import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { NodeTypes } from '../chart/chart.consts';
import { ChartWrapper } from '../chart/chart.wrapper';
import { IdType, Node } from 'vis';
import { VisiNode } from '../types.nodejs';

const menuTypes = [NodeTypes.toDoNode, NodeTypes.groupNode]

export interface NodeMenuInfo {
  isDone?: boolean;
  isFailed?: boolean;
  text: string;
}

interface MenuNode {
  nodeId: IdType;
  info: NodeMenuInfo
}

interface MenuGroup {
  type: NodeTypes;
  nodes: MenuNode[];
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
      
      const menuNodes: MenuNode[] = nodesOfType.map((node: VisiNode) => ({
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
      if(this.selectedNodeId === nodeId) {
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
}