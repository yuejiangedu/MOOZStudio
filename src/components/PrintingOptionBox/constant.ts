

export const optionCategory = [
  {
    title: 'resolution',
    category: 'resolution',
    data: [
      {
        label: 'Layer Height',
        unit: 'mm',
        key: 'layer_height',
        value: 0
      }
    ]
  },
  {
    title: 'shell',
    category: 'shell',
    data: [
      {
        label: 'Wall Thickness',
        unit: 'mm',
        key: 'wall_thickness',
        value: 0
      },
      {
        label: 'Top/Bottom Thickness',
        unit: 'mm',
        key: 'top_bottom_thickness',
        value: 0
      },
      {
        label: 'Print Thin Walls',
        unit: 'mm',
        check: false,
        key: 'fill_outline_gaps',
        value: 0
      }
    ]
  },
  {
    title: 'Infill',
    category: 'infill',
    data: [
      {
        label: 'Infill Density',
        unit: '%',
        key: 'infill_sparse_density',
        value: 0
      }
    ]
  },
  {
    title: 'Speed',
    category: 'speed',
    data: [
      {
        label: 'Print Speed',
        unit: 'mm/s',
        key: 'speed_print',
        child: [
          {
            label: 'Infill Speed',
            unit: 'mm/s',
            key: 'speed_infill',
            value: 0,
            child: [
              {
                label: 'Outer Wall Speed',
                unit: 'mm/s',
                key: 'speed_wall_0',
                value: 0
              },
              {
                label: 'Inner Wall Speed',
                unit: 'mm/s',
                key: 'speed_wall_x',
                value: 0
              }
            ]
          },
          {
            label: 'Top/Bottom Speed',
            unit: 'mm/s',
            key: 'speed_topbottom',
            value: 0
          }
        ]
      },
      {
        label: 'Travel Speed',
        unit: 'mm/s',
        key: 'speed_travel',
        value: 0
      },
      {
        label: 'Initial Layer Speed',
        unit: 'mm/s',
        key: 'speed_layer_0',
        value: 0,
        child: [
          {
            label: 'Initial Layer Print Speed',
            unit: 'mm/s',
            key: 'speed_print_layer_0',
            value: 0
          },
          {
            label: 'Initial Layer Travel Speed',
            unit: 'mm/s',
            key: 'speed_travel_layer_0',
            value: 0
          }
        ]
      }
    ]
  },
  {
    title: 'Travel',
    category: 'travel',
    data: [
      {
        label: 'Enable Retraction',
        unit: 'mm',
        check: true,
        key: 'retraction_enable',
        value: true,
        extra: {
          'true': [
            {
              label: 'Retraction Distance',
              unit: 'mm',
              key: 'retraction_amount',
              value: 0
            },
            {
              label: 'Retraction Speed',
              unit: 'mm/s',
              key: 'retraction_speed',
              value: 0
            }
          ]
        }
      },
    ]
  },
  {
    title: 'Cooling',
    category: 'cooling',
    data: [
      {
        label: 'Enable Print Cooling',
        unit: 'mm',
        check: true,
        key: 'cool_fan_enabled',
        value: true
      }
    ]
  },
  {
    title: 'Support',
    category: 'support',
    data: [
      {
        label: 'Generate Support',
        unit: 'mm',
        check: true,
        key: 'support_enable',
        value: true,
        extra: {
          'true': [
            {
              label: 'Support Placement',
              unit: 'mm',
              selection: ['everywhere', 'buildplate'],
              key: 'support_type',
              value: 'everywhere'
            },
            {
              label: 'Support Overhang Angle',
              unit: '°',
              key: 'support_angle',
              value: 0
            },
            {
              label: 'Support Density',
              unit: '%',
              key: 'support_infill_rate',
              value: 0
            }
          ]
        }
      },
    ]
  },
  {
    title: 'Platform Adhesion',
    category: 'platform_adhesion',
    data: [
      {
        label: 'Build Plate Adhesion Type',
        unit: 'mm',
        selection: ['brim', 'skirt', 'raft', 'none'],
        key: 'adhesion_type',
        value: 'none',
        extra:
        {
          'skirt': [
            {
              label: 'Skirt Line Count',
              unit: ' ',
              key: 'skirt_line_count',
              value: 3
            }
          ],
          'raft': [
            {
              label: 'Initial Layer Z Overlap',
              unit: 'mm',
              key: 'layer_0_z_overlap',
              value: 0.22
            },
            {
              label: 'Raft Air Gap',
              unit: 'mm',
              key: 'raft_airgap',
              value: 0.2
            },
            {
              label: 'Raft Extra Margin',
              unit: 'mm',
              key: 'raft_margin',
              value: 5
            }
          ],
          'brim': [
            {
              label: 'Brim Width',
              unit: 'mm',
              key: 'brim_width',
              value: 8,
              child: [
                {
                  label: 'Brim Line Count',
                  unit: ' ',
                  key: 'brim_line_count',
                  value: 20
                },
              ]
            },
            {
              label: 'Brim Only on Outside',
              unit: ' ',
              check: true,
              key: 'brim_outside_only',
              value: true
            }
          ]
        }
      }
    ]
  },
  {
    title: 'Special Mode',
    category: 'blackmagic',
    data: [
      {
        label: 'Spiralize Outer Contour',
        unit: 'mm',
        check: true,
        key: 'magic_spiralize',
        value: true
      }
    ]
  }
];

export const materialConfigs = [
  {
    label: 'Print Temperature',
    unit: '℃',
    key: 'material_print_temperature',
    value: 0
  },
  {
    label: 'Bed Temperature',
    unit: '℃',
    key: 'material_bed_temperature',
    value: 0
  },
  {
    label: 'Flow',
    unit: '%',
    key: 'material_flow',
    value: 0
  }
];
