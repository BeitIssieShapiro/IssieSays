import React, { useState, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';


const FadeInView = (props) => {
  const [fadeAdmin] = useState(new Animated.Value(0))
  const [hide, setHide] = useState(false)
  // the size the panel opens to: the content is laid out at it, not at the animated size
  const openSize = useRef(0);
  const target = props.width ? props.width : props.height;
  if (target > 0) openSize.current = target;

  useEffect(() => {
    setHide(false)

    Animated.timing(
      fadeAdmin,
      {
        toValue: target,
        duration: props.duration || 500,
        useNativeDriver: false,

      }
    ).start(({ finished }) => {
      // a stopped animation (it was reopened while closing) must not hide the panel
      if (finished) setHide(target == 0);
    });
  }, [props.height, props.width])

  if (hide) {
    return (<View />);
  }
  // The animated size is not always laid out again as it changes (the panel then showed, but a
  // list in it kept the size it had when it opened: none). So the content gets the full size from
  // the start, and the animation only reveals it.
  const { flexDirection, alignItems, justifyContent } = StyleSheet.flatten(props.style) || {};
  return (<Animated.View
      testID={props.testID}
      style={[props.style, {
        overflow: props.overflow || "hidden",
        //opacity: fadeAdmin,         // Bind opacity to animated value
      }, props.width ? { width: fadeAdmin } : { height: fadeAdmin }]}
    >
      <View style={[{ flexDirection, alignItems, justifyContent },
        props.width ? { width: openSize.current, height: "100%" } : { height: openSize.current, width: "100%" }]}>
        {props.children}
      </View>
    </Animated.View>
  );
}

export default FadeInView;
