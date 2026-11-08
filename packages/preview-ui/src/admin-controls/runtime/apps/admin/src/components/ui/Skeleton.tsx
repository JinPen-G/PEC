import { Skeleton as ArcSkeleton, type SkeletonProps } from "../../../../../packages/ui-arc/vendor/registry/components/skeleton/skeleton";
import { useLocale } from "../../../../../../environment";
export function Skeleton(props: SkeletonProps) {
  const { t } = useLocale();
  return <ArcSkeleton {...props} label={props.label ?? t("加载中")} />;
}
