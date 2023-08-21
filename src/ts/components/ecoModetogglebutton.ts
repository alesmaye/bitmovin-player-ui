import { ToggleButton, ToggleButtonConfig } from './togglebutton';
import { UIInstanceManager } from '../uimanager';
import { DynamicAdaptationConfig, PlayerAPI, VideoQualityChangedEvent } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

export class EcoModeToggle extends ToggleButton<ToggleButtonConfig> {
  private adaptationConfig: DynamicAdaptationConfig;
  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    const defaultConfig: ToggleButtonConfig = {
      text: i18n.getLocalizer('ecoMode'),
      cssClass: 'ui-ecoModetogglebutton',
      onClass: 'on',
      offClass: 'off',
      ariaLabel: i18n.getLocalizer('ecoMode'),
    };

    this.config = this.mergeConfig(config, defaultConfig, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      this.toggle();
    });

    this.onToggleOn.subscribe(() => {
      this.enableEcoMode(player);
      player.setVideoQuality('auto');
    });

    this.onToggleOff.subscribe(() => {
      this.disableEcoMode(player);
    });

    player.on(player.exports.PlayerEvent.VideoQualityChanged, (quality: VideoQualityChangedEvent) => {
      if (quality.targetQuality.height !== null) {
        this.off();
        this.disableEcoMode(player);
      }
    });
  }
  enableEcoMode(player: PlayerAPI) {
    this.adaptationConfig = player.adaptation.getConfig();

    if (player.getAvailableVideoQualities()[0].codec.includes('avc')) {
      player.adaptation.setConfig({
        resolution: { maxSelectableVideoHeight: 720 },
      } as DynamicAdaptationConfig);
    }
    if (
      player.getAvailableVideoQualities()[0].codec.includes('hvc') ||
      player.getAvailableVideoQualities()[0].codec.includes('hev')
    ) {
      player.adaptation.setConfig({
        resolution: { maxSelectableVideoHeight: 1080 },
      } as DynamicAdaptationConfig);
    }
    if (
      player.getAvailableVideoQualities()[0].codec.includes('av1') ||
      player.getAvailableVideoQualities()[0].codec.includes('av01')
    ) {
      player.adaptation.setConfig({
        resolution: { maxSelectableVideoHeight: 1440 },
      } as DynamicAdaptationConfig);
    }
  }

  disableEcoMode(player: PlayerAPI) {
    player.adaptation.setConfig(this.adaptationConfig);
  }
}
